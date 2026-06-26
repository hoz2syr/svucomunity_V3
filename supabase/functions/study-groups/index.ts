import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ATTEMPTS = 10;

async function checkRateLimit(supabaseAdmin: SupabaseClient, key: string): Promise<{ allowed: boolean; retryAfterMs: number }> {
  const { data, error } = await supabaseAdmin.rpc('check_and_increment_rate_limit', {
    p_key: key,
    p_window_ms: RATE_LIMIT_WINDOW_MS,
    p_max_attempts: RATE_LIMIT_MAX_ATTEMPTS,
  });
  if (error) return { allowed: true, retryAfterMs: 0 };
  const allowed = (data?.[0]?.allowed as boolean | undefined) ?? false;
  const retryAfterMs = (data?.[0]?.retry_after_ms as number | undefined) ?? 0;
  return { allowed, retryAfterMs };
}

function validateUrl(url: string | undefined): boolean {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function validateGroupPayload(body: any): string | null {
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 3) {
    return 'اسم المجموعة مطلوب (3 أحرف على الأقل)';
  }
  if (!body.course_name || typeof body.course_name !== 'string') {
    return 'اسم المادة مطلوب';
  }
  if (!body.course_code || typeof body.course_code !== 'string') {
    return 'رمز المادة مطلوب';
  }
  if (!body.major || typeof body.major !== 'string') {
    return 'التخصص مطلوب';
  }
  if (!body.whatsapp_link || typeof body.whatsapp_link !== 'string') {
    return 'رابط الواتساب مطلوب';
  }
  if (!validateUrl(body.whatsapp_link)) {
    return 'رابط الواتساب غير صالح';
  }
  if (body.group_link && !validateUrl(body.group_link)) {
    return 'رابط المجموعة غير صالح';
  }
  if (body.max_members < 2 || body.max_members > 20) {
    return 'عدد الأعضاء يجب أن يكون بين 2 و 20';
  }
  return null;
}

interface Course { code: string; name: string; }

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

async function handleGetAll(supabaseAdmin: SupabaseClient, userId: string | null) {
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
    .select("id, name, course_name, course_code, class_number, doctor_name, major, max_members, current_members, whatsapp_link, group_link, is_full, creator_id, creator_name, created_at")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  if (createdError) throw new Error(createdError.message);

  const createdIds = new Set((created || []).map((g) => g.id));

  const { data: memberships, error: memberError } = await supabaseAdmin
    .from("group_members")
    .select("group_id, joined_at")
    .eq("user_id", userId);

  if (memberError) throw new Error(memberError.message);

  const joinedGroupIds = [...new Set((memberships || []).map((m) => m.group_id))].filter(id => !createdIds.has(id));

  let joined: any[] = [];
  if (joinedGroupIds.length > 0) {
    const { data: joinedData, error: joinedError } = await supabaseAdmin
      .from("groups")
      .select("id, name, course_name, course_code, class_number, doctor_name, major, max_members, current_members, whatsapp_link, group_link, is_full, creator_id, creator_name, created_at")
      .in("id", joinedGroupIds);
    if (joinedError) throw new Error(joinedError.message);
    joined = joinedData || [];
  }

  return { created: created || [], joined };
}

async function handleCreate(supabaseAdmin: SupabaseClient, body: any, userId: string) {
   const validationError = validateGroupPayload(body);
   if (validationError) throw new Error(validationError);

   const { name, course_name, course_code, class_number, doctor_name, major, whatsapp_link, group_link, max_members, creator_name } = body;

   const { data, error } = await supabaseAdmin
     .from("groups")
     .insert({
       name, course_name, course_code, class_number, doctor_name, major,
       whatsapp_link, group_link, max_members,
       current_members: 1,
       is_full: false,
       creator_id: userId,
       creator_name: creator_name || userId,
     })
     .select()
     .single();

   if (error) throw new Error(error.message);
   if (!data) throw new Error("فشل إنشاء المجموعة");

   await supabaseAdmin.from("group_members").insert({
     group_id: data.id,
     user_id: userId,
   });

   return data;
 }

async function handleJoin(supabaseAdmin: SupabaseClient, groupId: string, userId: string) {
  const { error: memberError } = await supabaseAdmin
    .from("group_members")
    .insert({ group_id: groupId, user_id: userId });

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

async function handleLeave(supabaseAdmin: SupabaseClient, groupId: string, userId: string) {
  const { error: memberError } = await supabaseAdmin
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

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

async function handleUpdate(supabaseAdmin: SupabaseClient, groupId: string, updates: any, userId: string) {
   if (updates.whatsapp_link && !validateUrl(updates.whatsapp_link)) {
     throw new Error('رابط الواتساب غير صالح');
   }
   if (updates.group_link && !validateUrl(updates.group_link)) {
     throw new Error('رابط المجموعة غير صالح');
   }
   
   const { data: group, error: checkError } = await supabaseAdmin
     .from("groups")
     .select("creator_id")
     .eq("id", groupId)
     .single();
   
   if (checkError || !group || group.creator_id !== userId) {
     throw new Error('غير مخول لتعديل هذه المجموعة');
   }
   
   const { data, error } = await supabaseAdmin
     .from("groups")
     .update(updates)
     .eq("id", groupId)
     .select()
     .single();

  if (error) throw new Error(error.message);
  return data;
}

async function handleDelete(supabaseAdmin: SupabaseClient, groupId: string, userId: string, isAdmin: boolean) {
   const { data: group, error: checkError } = await supabaseAdmin
     .from("groups")
     .select("creator_id")
     .eq("id", groupId)
     .single();
   
   if (checkError || !group) {
     throw new Error('المجموعة غير موجودة');
   }
   
   if (!isAdmin && group.creator_id !== userId) {
     throw new Error('غير مخول لحذف هذه المجموعة');
   }
   
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

async function handleGetMembers(supabaseAdmin: SupabaseClient, groupId: string, userId: string) {
  if (!userId) throw new Error("Unauthorized");

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
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    return data?.role === 'admin';
  } catch {
    return false;
  }
}

async function handleGetCoursesByMajor(supabaseAdmin: SupabaseClient, major: string): Promise<Course[]> {
  try {
    const res = await fetch("https://raw.githubusercontent.com/svu-community/svu-courses/main/svu_courses.json");
    if (res.ok) {
      const catalog: Record<string, { name: string; code: string }[]> = await res.json();
      const raw = catalog[major];
      if (raw) return raw.map((c) => ({ code: c.code, name: c.name }));
    }
  } catch {}
  
  const { data, error } = await supabaseAdmin
    .from("groups")
    .select("course_code, course_name")
    .eq("major", major);
  
  if (error) return [];
  return [...new Map(data.map(g => [g.course_code, { code: g.course_code, name: g.course_name }]))]
    .map(([_, v]) => v as Course);
}

async function handleGetAvailableMajors(supabaseAdmin: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("groups")
    .select("major")
    .not("major", "is", null);
  
  if (error) return [];
  return [...new Set(data.map(g => g.major).filter(Boolean))].sort();
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
   const clientIp = getClientIp(req);
   const rateLimit = await checkRateLimit(supabaseAdmin, `study-groups:${clientIp}`);
   if (!rateLimit.allowed) {
     return jsonResponse({ error: "Rate limit exceeded", retryAfterMs: rateLimit.retryAfterMs }, 429, origin);
   }

   const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
   const userId = await getAuthUserId(req, supabaseAdmin);
   const isAdmin = userId ? await handleCheckIsAdmin(supabaseAdmin, userId) : false;

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
          if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
          result = await handleGetAll(supabaseAdmin, userId);
          break;
       case "getMyGroups":
         if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
         result = await handleGetMyGroups(supabaseAdmin, userId);
         break;
       case "create":
         if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
         result = await handleCreate(supabaseAdmin, payload, userId);
         break;
       case "join":
         if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
         await handleJoin(supabaseAdmin, payload.groupId, userId);
         result = { success: true };
         break;
       case "leave":
         if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
         await handleLeave(supabaseAdmin, payload.groupId, userId);
         result = { success: true };
         break;
       case "update":
         if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
         result = await handleUpdate(supabaseAdmin, payload.groupId, payload.updates, userId);
         break;
       case "delete":
         if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
         await handleDelete(supabaseAdmin, payload.groupId, userId, isAdmin);
         result = { success: true };
         break;
        case "getMembers":
          if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
          result = await handleGetMembers(supabaseAdmin, payload.groupId, userId);
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
         result = await handleGetCoursesByMajor(supabaseAdmin, payload.major);
         break;
       case "getAvailableMajors":
         result = await handleGetAvailableMajors(supabaseAdmin);
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
