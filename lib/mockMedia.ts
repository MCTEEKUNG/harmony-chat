// Mock media for the GIF / Sticker picker.
// These are stand-ins for real Tenor/Giphy results, using publicly-loadable
// placeholder image services. No third-party branded assets are used.

export type MediaItem = {
  id: string;
  url: string;
  tags: string[];
};

// "GIFs" — animated-feel placeholders via picsum (deterministic by seed).
export const GIFS: MediaItem[] = [
  { id: "gif-celebrate", url: "https://picsum.photos/seed/celebrate/220/160", tags: ["celebrate", "party", "happy"] },
  { id: "gif-dance", url: "https://picsum.photos/seed/dance/220/160", tags: ["dance", "party", "fun"] },
  { id: "gif-laugh", url: "https://picsum.photos/seed/laugh/220/160", tags: ["laugh", "lol", "funny"] },
  { id: "gif-cat", url: "https://picsum.photos/seed/catvibe/220/160", tags: ["cat", "animal", "cute"] },
  { id: "gif-dog", url: "https://picsum.photos/seed/dogvibe/220/160", tags: ["dog", "animal", "cute"] },
  { id: "gif-wow", url: "https://picsum.photos/seed/wow/220/160", tags: ["wow", "shocked", "surprise"] },
  { id: "gif-thumbsup", url: "https://picsum.photos/seed/thumbsup/220/160", tags: ["thumbsup", "yes", "approve"] },
  { id: "gif-facepalm", url: "https://picsum.photos/seed/facepalm/220/160", tags: ["facepalm", "oops", "fail"] },
  { id: "gif-love", url: "https://picsum.photos/seed/loveheart/220/160", tags: ["love", "heart", "cute"] },
  { id: "gif-cry", url: "https://picsum.photos/seed/cry/220/160", tags: ["cry", "sad", "tears"] },
  { id: "gif-fire", url: "https://picsum.photos/seed/fire/220/160", tags: ["fire", "lit", "hype"] },
  { id: "gif-mindblown", url: "https://picsum.photos/seed/mindblown/220/160", tags: ["mindblown", "wow", "shocked"] },
];

// "Stickers" — fun, original-feel avatars via dicebear (SVG, deterministic by seed).
export const STICKERS: MediaItem[] = [
  { id: "stk-grin", url: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=grin", tags: ["grin", "happy", "smile"] },
  { id: "stk-cool", url: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=cool", tags: ["cool", "sunglasses", "chill"] },
  { id: "stk-wink", url: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=wink", tags: ["wink", "playful", "fun"] },
  { id: "stk-love", url: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=love", tags: ["love", "heart", "cute"] },
  { id: "stk-sad", url: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=sad", tags: ["sad", "cry", "down"] },
  { id: "stk-angry", url: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=angry", tags: ["angry", "mad", "rage"] },
  { id: "stk-shock", url: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=shock", tags: ["shock", "surprise", "wow"] },
  { id: "stk-sleepy", url: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=sleepy", tags: ["sleepy", "tired", "zzz"] },
  { id: "stk-silly", url: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=silly", tags: ["silly", "tongue", "fun"] },
  { id: "stk-nerd", url: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=nerd", tags: ["nerd", "smart", "glasses"] },
  { id: "stk-party", url: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=party", tags: ["party", "celebrate", "hype"] },
  { id: "stk-robot", url: "https://api.dicebear.com/9.x/bottts/svg?seed=robot", tags: ["robot", "bot", "tech"] },
];
