import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const getAllowedOrigins = () =>
  (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const getClientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

const getAllowedOrigin = (origin: string | null | undefined) => {
  if (!origin) return null;
  const whitelist = getAllowedOrigins();
  if (whitelist.includes(origin)) return origin;
  if (origin.endsWith('.pages.dev')) return origin;
  return null;
};

const corsHeaders = (origin: string | null | undefined) => {
  const allowedOrigin = getAllowedOrigin(origin);
  const headers = new Headers({
    "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  });

  if (allowedOrigin) {
    headers.set("Access-Control-Allow-Origin", allowedOrigin);
    headers.set("Access-Control-Allow-Credentials", "true");
  }

  return headers;
};

const jsonResponse = (
  body: Record<string, unknown>,
  status: number,
  origin: string | null | undefined,
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...Object.fromEntries(corsHeaders(origin).entries()),
      "Content-Type": "application/json",
    },
  });

async function getAuthUserId(req: Request, supabaseAdmin: SupabaseClient) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

async function handleGetAll(supabaseAdmin: SupabaseClient) {
  const { data, error } = await supabaseAdmin
    .from("groups")
    .select("id, name, course_name, course_code, class_number, doctor_name, major, max_members, current_members, whatsapp_link, group_link, is_full, creator_id, creator_name, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

async function handleGetMyGroups(supabaseAdmin: SupabaseClient, userId: string) {
  const { data: created, error: createdError } = await supabaseAdmin
    .from("groups")
    .select("*")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  if (createdError) throw new Error(createdError.message);

  const { data: memberships, error: memberError } = await supabaseAdmin
    .from("group_members")
    .select("group_id, joined_at")
    .eq("user_id", userId);

  if (memberError) throw new Error(memberError.message);

  const joinedGroupIds = new Set((memberships || []).map((m) => m.group_id));
  const createdIds = new Set((created || []).map((g) => g.id));
  const joinedOnlyIds = [...joinedGroupIds].filter((id) => !createdIds.has(id));

  let joined: any[] = [];
  if (joinedOnlyIds.length > 0) {
    const { data: joinedData, error: joinedError } = await supabaseAdmin
      .from("groups")
      .select("*")
      .in("id", joinedOnlyIds);
    if (joinedError) throw new Error(joinedError.message);
    joined = joinedData || [];
  }

  return { created: created || [], joined };
}

async function handleCreate(supabaseAdmin: SupabaseClient, body: any) {
  const { data, error } = await supabaseAdmin
    .from("groups")
    .insert({
      ...body,
      current_members: 1,
      is_full: false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("فشل إنشاء المجموعة");

  await supabaseAdmin.from("group_members").insert({
    group_id: data.id,
    user_id: body.creator_id,
  });

  return data;
}

async function handleJoin(supabaseAdmin: SupabaseClient, groupId: string) {
  const { error: memberError } = await supabaseAdmin
    .from("group_members")
    .insert({ group_id: groupId, user_id: "" });

  if (memberError) throw new Error(memberError.message);

  const { data: group, error: groupFetchError } = await supabaseAdmin
    .from("groups")
    .select("current_members, max_members")
    .eq("id", groupId)
    .single();

  if (groupFetchError) throw new Error(groupFetchError.message);

  const newCount = (group?.current_members || 0) + 1;
  const isFull = newCount >= (group?.max_members || 1);

  const { error: updateError } = await supabaseAdmin
    .from("groups")
    .update({ current_members: newCount, is_full: isFull })
    .eq("id", groupId);

  if (updateError) throw new Error(updateError.message);
}

async function handleLeave(supabaseAdmin: SupabaseClient, groupId: string) {
  const { error: memberError } = await supabaseAdmin
    .from("group_members")
    .delete()
    .eq("group_id", groupId);

  if (memberError) throw new Error(memberError.message);

  const { data: group, error: groupFetchError } = await supabaseAdmin
    .from("groups")
    .select("current_members, max_members")
    .eq("id", groupId)
    .single();

  if (groupFetchError) throw new Error(groupFetchError.message);

  const newCount = Math.max(0, (group?.current_members || 0) - 1);
  const isFull = newCount >= (group?.max_members || 1);

  const { error: updateError } = await supabaseAdmin
    .from("groups")
    .update({ current_members: newCount, is_full: isFull })
    .eq("id", groupId);

  if (updateError) throw new Error(updateError.message);
}

async function handleUpdate(supabaseAdmin: SupabaseClient, groupId: string, updates: any) {
  const { data, error } = await supabaseAdmin
    .from("groups")
    .update(updates)
    .eq("id", groupId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function handleDelete(supabaseAdmin: SupabaseClient, groupId: string) {
  const { error: memberError } = await supabaseAdmin
    .from("group_members")
    .delete()
    .eq("group_id", groupId);

  if (memberError) throw new Error(memberError.message);

  const { error: groupError } = await supabaseAdmin
    .from("groups")
    .delete()
    .eq("id", groupId);

  if (groupError) throw new Error(groupError.message);
}

async function handleGetMembers(supabaseAdmin: SupabaseClient, groupId: string) {
  const { data, error } = await supabaseAdmin
    .from("group_members")
    .select("id, user_id, joined_at")
    .eq("group_id", groupId);

  if (error) throw new Error(error.message);
  return data || [];
}

async function handleCheckMembership(supabaseAdmin: SupabaseClient, groupId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return false;
  return !!data;
}

async function handleCheckIsAdmin(supabaseAdmin: SupabaseClient, userId: string) {
  try {
    const { data } = await supabaseAdmin
      .from("users")
      .select("is_admin")
      .eq("id", userId)
      .single();
    return !!data?.is_admin;
  } catch {
    return false;
  }
}

serve(async (req) => {
  const origin = req.headers.get("Origin");

  if (req.method === "OPTIONS") {
    if (origin && !getAllowedOrigin(origin)) {
      return new Response(null, { status: 403, headers: corsHeaders(origin) });
    }
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse({ error: "Server configuration error" }, 500, origin);
  }

  const allowedOrigin = getAllowedOrigin(origin);
  if (origin && !allowedOrigin) {
    return jsonResponse({ error: "Forbidden origin" }, 403, origin);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const userId = await getAuthUserId(req, supabaseAdmin);

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const action = body.action as string;
    const payload = body.payload || body;

    let result: any;

    switch (action) {
      case "getAll":
        result = await handleGetAll(supabaseAdmin);
        break;
      case "getMyGroups":
        if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
        result = await handleGetMyGroups(supabaseAdmin, userId);
        break;
      case "create":
        if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
        result = await handleCreate(supabaseAdmin, { ...payload, creator_id: userId });
        break;
      case "join":
        if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
        await handleJoin(supabaseAdmin, payload.groupId);
        result = { success: true };
        break;
      case "leave":
        if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
        await handleLeave(supabaseAdmin, payload.groupId);
        result = { success: true };
        break;
      case "update":
        if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
        result = await handleUpdate(supabaseAdmin, payload.groupId, payload.updates);
        break;
      case "delete":
        if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
        await handleDelete(supabaseAdmin, payload.groupId);
        result = { success: true };
        break;
      case "getMembers":
        result = await handleGetMembers(supabaseAdmin, payload.groupId);
        break;
      case "checkMembership":
        if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
        result = await handleCheckMembership(supabaseAdmin, payload.groupId, userId);
        break;
      case "checkIsAdmin":
        if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
        result = await handleCheckIsAdmin(supabaseAdmin, userId);
        break;
      case "getCoursesByMajor":
        result = payload.courses || [];
        break;
      case "getAvailableMajors":
        result = payload.majors || [];
        break;
      default:
        return jsonResponse({ error: "Invalid action" }, 400, origin);
    }

    return jsonResponse({ data: result }, 200, origin);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return jsonResponse({ error: message }, 500, origin);
  }
});
