"use client";

import { useEffect, useRef, useState } from "react";
import { PhoneOff, Video, VideoOff, ScreenShare } from "lucide-react";
import { Channel, Profile } from "@/lib/types";
import { Tooltip } from "./Tooltip";

/**
 * Compact "Voice Connected" panel shown above the user panel (Discord places
 * the voice status bottom-left, not over the text chat). Mic/deafen live in the
 * user panel; this panel owns video, screen share and disconnect.
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
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  const [connected, setConnected] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [screenOn, setScreenOn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setConnected(false);
    setError(null);
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        audioStreamRef.current = stream;
        setConnected(true);
      })
      .catch(() => {
        if (active) {
          setError("Mic unavailable — connected without input.");
          setConnected(true);
        }
      });
    return () => {
      active = false;
      audioStreamRef.current?.getTracks().forEach((t) => t.stop());
      videoStreamRef.current?.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
      videoStreamRef.current = null;
    };
  }, [channel.id]);

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
      /* user cancelled the picker */
    }
  }

  const showVideo = camOn || screenOn;

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
          <span className="block truncate text-xs text-d-muted">{channel.name}</span>
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

      <div className={`mt-2 overflow-hidden rounded-md bg-[#0b0b12] ${showVideo ? "" : "hidden"}`}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="aspect-video w-full object-cover"
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <button
          onClick={toggleCam}
          className={`flex items-center justify-center gap-1.5 rounded py-1.5 text-xs font-medium transition ${
            camOn ? "bg-d-active text-white" : "bg-d-dark text-d-muted hover:bg-d-hover hover:text-d-text"
          }`}
        >
          {camOn ? <Video size={16} /> : <VideoOff size={16} />} Video
        </button>
        <button
          onClick={toggleScreen}
          className={`flex items-center justify-center gap-1.5 rounded py-1.5 text-xs font-medium transition ${
            screenOn ? "bg-d-active text-white" : "bg-d-dark text-d-muted hover:bg-d-hover hover:text-d-text"
          }`}
        >
          <ScreenShare size={16} /> Screen
        </button>
      </div>

      <span className="sr-only">Connected as {me.display_name}</span>
    </div>
  );
}
