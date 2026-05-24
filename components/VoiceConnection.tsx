"use client";

import { useEffect, useRef, useState } from "react";
import { Video, VideoOff, ScreenShare, PhoneOff, Volume2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Channel, Profile } from "@/lib/types";
import { Tooltip } from "./Tooltip";
import { setSpeaking, clearSpeaking } from "@/lib/voiceState";

// Speaking-detection tuning.
const SPEAK_RMS_THRESHOLD = 0.02; // minimum normalized RMS to count as "talking"
const SPEAK_HANGOVER_MS = 250; // keep "speaking" this long after volume drops

const ICE: RTCConfiguration = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }],
};

/**
 * Voice panel with a real WebRTC **audio** mesh so everyone in the same voice
 * channel hears each other. Signaling rides a Supabase Realtime channel
 * (presence for discovery + broadcast for offer/answer/ICE). Audio tracks are
 * fixed for the connection's life (mute = track.enabled), so there is no
 * renegotiation. Camera / screen are local self-preview for now.
 */
export default function VoiceConnection({
  channel,
  me,
  onLeave,
}: {
  channel: Channel;
  me: Profile;
  onLeave: () => void;
}) {
  const meRef = useRef(me);
  meRef.current = me;

  const localStreamRef = useRef<MediaStream | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const peerNamesRef = useRef<Map<string, string>>(new Map());
  const chanRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Web Audio speaking detection: one AudioContext, one rAF loop, and a
  // per-userId analyser. `lastAboveAt` gives a short hangover so the ring
  // doesn't flicker between syllables.
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analysersRef = useRef<
    Map<
      string,
      { source: MediaStreamAudioSourceNode; analyser: AnalyserNode; data: Uint8Array<ArrayBuffer> }
    >
  >(new Map());
  const lastAboveRef = useRef<Map<string, number>>(new Map());
  const rafRef = useRef<number | null>(null);

  const [connected, setConnected] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [screenOn, setScreenOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remotes, setRemotes] = useState<Record<string, { name: string; stream: MediaStream }>>({});

  useEffect(() => {
    let cancelled = false;
    const pcs = pcsRef.current;
    const myId = me.id;
    const channelId = channel.id;

    const analysers = analysersRef.current;
    const lastAbove = lastAboveRef.current;

    // Attach an AnalyserNode for a stream, keyed by the userId it represents.
    // No-op if there's no AudioContext, no audio tracks, or it's already wired.
    function attachAnalyser(userId: string, stream: MediaStream) {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (analysers.has(userId)) return;
      if (stream.getAudioTracks().length === 0) return; // createMediaStreamSource throws otherwise
      try {
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.4;
        source.connect(analyser); // source → analyser ONLY (never to destination)
        const data = new Uint8Array(new ArrayBuffer(analyser.fftSize));
        analysers.set(userId, { source, analyser, data });
      } catch (err) {
        console.error("analyser attach error", err);
      }
    }

    // Detach + clear speaking state for a userId.
    function detachAnalyser(userId: string) {
      const node = analysers.get(userId);
      if (node) {
        try {
          node.source.disconnect();
          node.analyser.disconnect();
        } catch {
          /* already disconnected */
        }
        analysers.delete(userId);
      }
      lastAbove.delete(userId);
      setSpeaking(userId, false);
    }

    function removePeer(peerId: string) {
      const pc = pcs.get(peerId);
      if (pc) {
        pc.onicecandidate = null;
        pc.ontrack = null;
        pc.onconnectionstatechange = null;
        pc.close();
      }
      pcs.delete(peerId);
      detachAnalyser(peerId);
      setRemotes((prev) => {
        if (!(peerId in prev)) return prev;
        const next = { ...prev };
        delete next[peerId];
        return next;
      });
    }

    async function start() {
      // 1. microphone
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
      } catch {
        if (!cancelled) setError("Mic unavailable — you can hear others but they can't hear you.");
        localStreamRef.current = new MediaStream();
      }
      if (cancelled) return;
      setConnected(true);

      // 1b. speaking detection — one AudioContext + rAF loop for everyone.
      const AC: typeof AudioContext | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        audioCtxRef.current = ctx;
        ctx.resume().catch(() => {}); // may start suspended; the mic gesture allows resume
        // local mic → me.id (guarded for the empty-stream mic-failure case)
        attachAnalyser(myId, localStreamRef.current!);

        const tick = () => {
          const now = performance.now();
          analysers.forEach(({ analyser, data }, userId) => {
            analyser.getByteTimeDomainData(data);
            // RMS of the waveform centered at 128 → 0..1
            let sum = 0;
            for (let i = 0; i < data.length; i++) {
              const v = (data[i] - 128) / 128;
              sum += v * v;
            }
            const rms = Math.sqrt(sum / data.length);
            if (rms > SPEAK_RMS_THRESHOLD) lastAbove.set(userId, now);
            const above = lastAbove.get(userId);
            setSpeaking(userId, above != null && now - above < SPEAK_HANGOVER_MS);
          });
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }

      // 2. signaling channel
      const chan = supabase.channel(`rtc:${channelId}`, {
        config: { presence: { key: myId } },
      });
      chanRef.current = chan;

      const send = (payload: Record<string, unknown>) =>
        chan.send({ type: "broadcast", event: "signal", payload });

      function createPeer(peerId: string) {
        const existing = pcs.get(peerId);
        if (existing) return existing;
        const pc = new RTCPeerConnection(ICE);
        pcs.set(peerId, pc);
        localStreamRef.current?.getAudioTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!));
        pc.onicecandidate = (e) => {
          if (e.candidate) send({ to: peerId, from: myId, ice: e.candidate.toJSON() });
        };
        pc.ontrack = (e) => {
          const stream = e.streams[0];
          if (!stream) return;
          attachAnalyser(peerId, stream); // remote stream → its peerId
          setRemotes((prev) => ({
            ...prev,
            [peerId]: { name: peerNamesRef.current.get(peerId) ?? "User", stream },
          }));
        };
        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "failed" || pc.connectionState === "closed") removePeer(peerId);
        };
        return pc;
      }

      async function callPeer(peerId: string) {
        const pc = createPeer(peerId);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          send({ to: peerId, from: myId, desc: pc.localDescription });
        } catch (err) {
          console.error("offer error", err);
        }
      }

      chan.on("broadcast", { event: "signal" }, async ({ payload }) => {
        const p = payload as {
          to: string;
          from: string;
          desc?: RTCSessionDescriptionInit;
          ice?: RTCIceCandidateInit;
        };
        if (p.to !== myId) return;
        const peerId = p.from;
        try {
          if (p.desc) {
            const pc = createPeer(peerId);
            await pc.setRemoteDescription(p.desc);
            if (p.desc.type === "offer") {
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              send({ to: peerId, from: myId, desc: pc.localDescription });
            }
          } else if (p.ice) {
            const pc = pcs.get(peerId);
            if (pc) await pc.addIceCandidate(p.ice).catch(() => {});
          }
        } catch (err) {
          console.error("signal error", err);
        }
      });

      chan.on("presence", { event: "sync" }, () => {
        const state = chan.presenceState() as Record<string, { name?: string }[]>;
        for (const [key, metas] of Object.entries(state)) {
          peerNamesRef.current.set(key, metas[0]?.name ?? "User");
        }
        const others = Object.keys(state).filter((k) => k !== myId);
        // deterministic initiator: the lexicographically smaller id calls
        others.forEach((pid) => {
          if (!pcs.has(pid) && myId < pid) callPeer(pid);
        });
        // drop peers who left
        Array.from(pcs.keys()).forEach((pid) => {
          if (!state[pid]) removePeer(pid);
        });
      });

      chan.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await chan.track({ name: meRef.current.display_name });
        }
      });
    }

    start();

    return () => {
      cancelled = true;
      // stop speaking detection: rAF → analyser/source nodes → AudioContext → store
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      analysers.forEach(({ source, analyser }) => {
        try {
          source.disconnect();
          analyser.disconnect();
        } catch {
          /* already disconnected */
        }
      });
      analysers.clear();
      lastAbove.clear();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {}); // don't await
        audioCtxRef.current = null;
      }
      clearSpeaking();

      pcs.forEach((pc) => {
        pc.onicecandidate = null;
        pc.ontrack = null;
        pc.onconnectionstatechange = null;
        pc.close();
      });
      pcs.clear();
      peerNamesRef.current.clear();
      if (chanRef.current) supabase.removeChannel(chanRef.current);
      chanRef.current = null;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      videoStreamRef.current?.getTracks().forEach((t) => t.stop());
      videoStreamRef.current = null;
      setRemotes({});
    };
  }, [channel.id, me.id]);

  async function stopVideo() {
    videoStreamRef.current?.getTracks().forEach((t) => t.stop());
    videoStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    setCamOn(false);
    setScreenOn(false);
  }

  async function toggleCam() {
    if (camOn) return stopVideo();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoStreamRef.current?.getTracks().forEach((t) => t.stop());
      videoStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setCamOn(true);
      setScreenOn(false);
    } catch {
      setError("Camera permission denied.");
    }
  }

  async function toggleScreen() {
    if (screenOn) return stopVideo();
    try {
      const md = navigator.mediaDevices as MediaDevices & {
        getDisplayMedia: (c: DisplayMediaStreamOptions) => Promise<MediaStream>;
      };
      const stream = await md.getDisplayMedia({ video: true });
      videoStreamRef.current?.getTracks().forEach((t) => t.stop());
      videoStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getVideoTracks()[0].addEventListener("ended", () => stopVideo());
      setScreenOn(true);
      setCamOn(false);
    } catch {
      /* cancelled */
    }
  }

  const showVideo = camOn || screenOn;
  const remoteList = Object.values(remotes);

  return (
    <div className="border-t border-black/40 bg-d-darkest/40 px-2 pb-2 pt-2">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="min-w-0">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-online">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-online opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-online" />
            </span>
            {connected ? "Voice Connected" : "Connecting…"}
          </span>
          <span className="block truncate text-xs text-d-muted">
            <Volume2 size={11} className="mr-1 inline" />
            {channel.name}
            {remoteList.length > 0 && ` · ${remoteList.length} connected`}
          </span>
        </div>
        <Tooltip label="Disconnect" side="top">
          <button
            onClick={onLeave}
            className="shrink-0 rounded p-1.5 text-d-muted hover:bg-d-hover hover:text-dnd"
          >
            <PhoneOff size={18} />
          </button>
        </Tooltip>
      </div>

      {error && <p className="px-1 pt-1 text-[11px] text-idle">{error}</p>}

      {/* remote audio (the actual "interact") */}
      {remoteList.map((r, i) => (
        <audio
          key={Object.keys(remotes)[i]}
          autoPlay
          ref={(el) => {
            if (el && el.srcObject !== r.stream) el.srcObject = r.stream;
          }}
        />
      ))}

      {/* local self-preview */}
      <div className={`mt-2 overflow-hidden rounded-md bg-[#0b0b12] ${showVideo ? "" : "hidden"}`}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video ref={localVideoRef} autoPlay muted playsInline className="aspect-video w-full object-cover" />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <CtrlButton active={camOn} onClick={toggleCam} label="Camera">
          {camOn ? <Video size={16} /> : <VideoOff size={16} />}
        </CtrlButton>
        <CtrlButton active={screenOn} onClick={toggleScreen} label="Screen">
          <ScreenShare size={16} />
        </CtrlButton>
      </div>
    </div>
  );
}

function CtrlButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded py-1.5 text-xs font-medium transition ${
        active ? "bg-d-active text-white" : "bg-d-dark text-d-muted hover:bg-d-hover hover:text-d-text"
      }`}
    >
      {children} {label}
    </button>
  );
}
