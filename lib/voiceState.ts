"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny dependency-free shared store of currently-speaking userIds.
 *
 * VoiceConnection writes to it (setSpeaking) from its Web Audio analyser loop;
 * ChannelSidebar rows read from it (useSpeaking) to draw the speaking ring.
 * No zustand / no context — just a module-level Set + listener set exposed
 * through React's useSyncExternalStore.
 */

const speaking = new Set<string>();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

/** Mark a user as speaking / not speaking. No-op (no emit) if unchanged. */
export function setSpeaking(userId: string, value: boolean): void {
  const has = speaking.has(userId);
  if (value === has) return;
  if (value) speaking.add(userId);
  else speaking.delete(userId);
  emit();
}

/** Clear all speaking state (used on voice leave / unmount). */
export function clearSpeaking(): void {
  if (speaking.size === 0) return;
  speaking.clear();
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(userId: string): boolean {
  return speaking.has(userId);
}

/** React hook: true while `userId` is currently speaking. */
export function useSpeaking(userId: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => getSnapshot(userId),
    () => false, // server snapshot — never speaking during SSR
  );
}
