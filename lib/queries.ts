import { supabase } from "./supabaseClient";
import { Channel, Member, Message, Profile, Server, UserStatus } from "./types";

export const PAGE_SIZE = 30;

export async function getMyProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data as Profile | null;
}

export async function getMyServers(userId: string): Promise<Server[]> {
  const { data, error } = await supabase
    .from("server_members")
    .select("server:servers(*)")
    .eq("user_id", userId);
  if (error) throw error;
  const rows = (data ?? []) as unknown as { server: Server | null }[];
  const servers = rows.map((row) => row.server).filter((s): s is Server => !!s);
  return servers.sort((a, b) => a.created_at.localeCompare(b.created_at));
}

/** All other users, treated as "friends" for the Friends/Home page. */
export async function getOtherProfiles(meId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", meId)
    .order("display_name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function getMutualServers(meId: string, userId: string): Promise<Server[]> {
  const [{ data: mine }, { data: theirs }] = await Promise.all([
    supabase.from("server_members").select("server_id").eq("user_id", meId),
    supabase.from("server_members").select("server:servers(*)").eq("user_id", userId),
  ]);
  const mineSet = new Set((mine ?? []).map((r: { server_id: string }) => r.server_id));
  const rows = (theirs ?? []) as unknown as { server: Server | null }[];
  return rows
    .map((r) => r.server)
    .filter((s): s is Server => !!s && mineSet.has(s.id));
}

export async function getServerChannels(serverId: string): Promise<Channel[]> {
  const { data, error } = await supabase
    .from("channels")
    .select("*")
    .eq("server_id", serverId)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Channel[];
}

export async function getServerMembers(serverId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from("server_members")
    .select("*, profile:profiles(*)")
    .eq("server_id", serverId);
  if (error) throw error;
  return (data ?? []) as Member[];
}

/** Latest page of messages for a channel, returned oldest-first for rendering. */
export async function getMessages(channelId: string, before?: string): Promise<Message[]> {
  let q = supabase
    .from("messages")
    .select("*, profile:profiles(*)")
    .eq("channel_id", channelId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);
  if (before) q = q.lt("created_at", before);
  const { data, error } = await q;
  if (error) throw error;
  return ((data ?? []) as Message[]).reverse();
}

export async function sendMessage(channelId: string, userId: string, content: string) {
  const { data, error } = await supabase
    .from("messages")
    .insert({ channel_id: channelId, user_id: userId, content })
    .select("*, profile:profiles(*)")
    .single();
  if (error) throw error;
  return data as Message;
}

export async function editMessage(id: string, content: string) {
  const { error } = await supabase
    .from("messages")
    .update({ content, edited_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteMessage(id: string) {
  const { error } = await supabase.from("messages").delete().eq("id", id);
  if (error) throw error;
}

export async function searchMessages(query: string, serverChannelIds: string[]): Promise<Message[]> {
  if (!query.trim() || serverChannelIds.length === 0) return [];
  const { data, error } = await supabase
    .from("messages")
    .select("*, profile:profiles(*)")
    .in("channel_id", serverChannelIds)
    .eq("is_deleted", false)
    .ilike("content", `%${query.trim()}%`)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as Message[];
}

export type ServerPreview = Server & { member_count: number; already_member: boolean };

export async function previewInvite(
  code: string,
  userId: string
): Promise<ServerPreview | null> {
  const { data: server } = await supabase
    .from("servers")
    .select("*")
    .eq("invite_code", code.trim())
    .maybeSingle();
  if (!server) return null;
  const { count } = await supabase
    .from("server_members")
    .select("*", { count: "exact", head: true })
    .eq("server_id", (server as Server).id);
  const { data: mine } = await supabase
    .from("server_members")
    .select("server_id")
    .eq("server_id", (server as Server).id)
    .eq("user_id", userId)
    .maybeSingle();
  return {
    ...(server as Server),
    member_count: count ?? 0,
    already_member: !!mine,
  };
}

export async function createServer(name: string, ownerId: string): Promise<Server> {
  const clean = name.trim();
  const slug =
    clean.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 20) ||
    "server";
  const invite = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  const { data, error } = await supabase
    .from("servers")
    .insert({
      name: clean,
      icon_url: `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(clean)}`,
      invite_code: invite,
      owner_id: ownerId,
    })
    .select("*")
    .single();
  if (error) throw error;
  const server = data as Server;
  await supabase.from("channels").insert([
    { server_id: server.id, name: "general", type: "text", position: 0 },
    { server_id: server.id, name: "random", type: "text", position: 1 },
    { server_id: server.id, name: "General Voice", type: "voice", position: 2 },
  ]);
  await supabase
    .from("server_members")
    .insert({ server_id: server.id, user_id: ownerId, role: "owner" });
  return server;
}

export async function joinServer(serverId: string, userId: string) {
  const { error } = await supabase
    .from("server_members")
    .insert({ server_id: serverId, user_id: userId, role: "member" });
  if (error) throw error;
}

export async function updateProfile(
  userId: string,
  patch: Partial<Pick<Profile, "display_name" | "avatar_url" | "status" | "custom_status">>
) {
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function setStatus(userId: string, status: UserStatus) {
  await updateProfile(userId, { status });
}

export async function joinVoice(channelId: string, userId: string) {
  const { error } = await supabase
    .from("voice_participants")
    .upsert({ channel_id: channelId, user_id: userId, joined_at: new Date().toISOString() });
  if (error) throw error;
}

export async function leaveVoice(channelId: string, userId: string) {
  await supabase
    .from("voice_participants")
    .delete()
    .eq("channel_id", channelId)
    .eq("user_id", userId);
}

export async function getVoiceParticipants(channelId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from("voice_participants")
    .select("user_id, profile:profiles(*)")
    .eq("channel_id", channelId);
  if (error) throw error;
  const rows = (data ?? []) as unknown as { user_id: string; profile: Profile | null }[];
  return rows.map((r) => ({
    server_id: "",
    user_id: r.user_id,
    role: "member",
    joined_at: "",
    profile: r.profile,
  }));
}
