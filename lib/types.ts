export type UserStatus = "online" | "idle" | "dnd" | "offline";

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  status: UserStatus;
  custom_status: string | null;
  created_at: string;
};

export type Server = {
  id: string;
  name: string;
  icon_url: string | null;
  invite_code: string;
  owner_id: string | null;
  created_at: string;
};

export type ChannelType = "text" | "voice";

export type Channel = {
  id: string;
  server_id: string;
  name: string;
  type: ChannelType;
  position: number;
  created_at: string;
};

export type Message = {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  edited_at: string | null;
  is_deleted: boolean;
  profile?: Profile | null;
};

export type Member = {
  server_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: Profile | null;
};

export const DEMO_USERS = [
  { email: "alice@demo.com", name: "Alice", seed: "Alice" },
  { email: "bob@demo.com", name: "Bob", seed: "Bob" },
  { email: "carol@demo.com", name: "Carol", seed: "Carol" },
  { email: "dave@demo.com", name: "Dave", seed: "Dave" },
];

export const DEMO_PASSWORD = "password123";
