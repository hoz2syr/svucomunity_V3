import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ATTEMPTS = 10;

async function checkRateLimit(
  supabaseUrl: string,
  serviceKey: string,
  key: string,
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  const { data, error } = await (await fetch(
    `${supabaseUrl}/rest/v1/rpc/check_and_increment_rate_limit`,
    {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_key: key,
        p_window_ms: RATE_LIMIT_WINDOW_MS,
        p_max_attempts: RATE_LIMIT_MAX_ATTEMPTS,
      }),
    },
  )).json().then((r) => r[0] ?? {}).catch(() => ({}));

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

const supabaseRest = async (
  supabaseUrl: string,
  serviceKey: string,
  path: string,
  init: RequestInit = {},
) => {
  const url = `${supabaseUrl}/rest/v1/${path}`;
  const headers = new Headers({
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    ...Object.fromEntries(new Headers(init.headers || {}).entries()),
  });
  return fetch(url, { ...init, headers });
};

async function getAuthUserId(req: Request, supabaseUrl: string, serviceKey: string) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const userResponse = await fetch(
    `${supabaseUrl}/auth/v1/user`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const userData = await userResponse.json();
  if (userResponse.status !== 200 || userData?.error) return null;
  return userData.user.id;
}

async function handleGetAll(supabaseUrl: string, serviceKey: string, userId: string | null) {
  const response = await supabaseRest(
    supabaseUrl,
    serviceKey,
    `groups?select=id,name,course_name,course_code,class_number,doctor_name,major,max_members,current_members,whatsapp_link,group_link,is_full,creator_id,creator_name,created_at&order=created_at.desc`,
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || "Failed to fetch groups");
  return data || [];
}

async function handleGetMyGroups(supabaseUrl: string, serviceKey: string, userId: string) {
  const createdResponse = await supabaseRest(
    supabaseUrl,
    serviceKey,
    `groups?select=id,name,course_name,course_code,class_number,doctor_name,major,max_members,current_members,whatsapp_link,group_link,is_full,creator_id,creator_name,created_at&creator_id=eq.${encodeURIComponent(userId)}&order=created_at.desc`,
  );
  const created = await createdResponse.json();
  if (!createdResponse.ok) throw new Error(created?.message || "Failed to fetch created groups");

  const createdIds = new Set((created || []).map((g: any) => g.id));

  const membershipsResponse = await supabaseRest(
    supabaseUrl,
    serviceKey,
    `group_members?select=group_id,joined_at&user_id=eq.${encodeURIComponent(userId)}`,
  );
  const memberships = await membershipsResponse.json();
  if (!membershipsResponse.ok) throw new Error(memberships?.message || "Failed to fetch memberships");

  const joinedGroupIds = [...new Set((memberships || []).map((m: any) => m.group_id))]
    .filter((id: string) => !createdIds.has(id));

  let joined: any[] = [];
  if (joinedGroupIds.length > 0) {
    const joinedResponse = await supabaseRest(
      supabaseUrl,
      serviceKey,
      `groups?select=id,name,course_name,course_code,class_number,doctor_name,major,max_members,current_members,whatsapp_link,group_link,is_full,creator_id,creator_name,created_at&id=in.(${joinedGroupIds.map((id: string) => encodeURIComponent(id)).join(",")})`,
    );
    joined = await joinedResponse.json();
    if (!joinedResponse.ok) throw new Error(joined?.message || "Failed to fetch joined groups");
  }

  return { created: created || [], joined };
}

async function handleCreate(supabaseUrl: string, serviceKey: string, body: any, userId: string) {
  const validationError = validateGroupPayload(body);
  if (validationError) throw new Error(validationError);

  const { name, course_name, course_code, class_number, doctor_name, major, whatsapp_link, group_link, max_members, creator_name } = body;

  const insertResponse = await supabaseRest(
    supabaseUrl,
    serviceKey,
    `groups?select=*`,
    {
      method: "POST",
      body: JSON.stringify({
        name, course_name, course_code, class_number, doctor_name, major,
        whatsapp_link, group_link, max_members,
        current_members: 1,
        is_full: false,
        creator_id: userId,
        creator_name: creator_name || userId,
      }),
    },
  );

  const data = await insertResponse.json();
  if (!insertResponse.ok) throw new Error(data?.message || "فشل إنشاء المجموعة");

  await supabaseRest(
    supabaseUrl,
    serviceKey,
    `group_members`,
    {
      method: "POST",
      body: JSON.stringify({
        group_id: data[0]?.id || data.id,
        user_id: userId,
      }),
    },
  );

  return data;
}

async function handleJoin(supabaseUrl: string, serviceKey: string, groupId: string, userId: string) {
  await supabaseRest(
    supabaseUrl,
    serviceKey,
    `group_members`,
    {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, user_id: userId }),
    },
  );

  const groupResponse = await supabaseRest(
    supabaseUrl,
    serviceKey,
    `groups?select=current_members,max_members&id=eq.${encodeURIComponent(groupId)}&limit=1`,
  );
  const group = await groupResponse.json();
  if (!groupResponse.ok || !group || group.length === 0) {
    throw new Error("Failed to fetch group");
  }

  const newCount = (group[0]?.current_members || 0) + 1;
  const isFull = newCount >= (group[0]?.max_members || 1);

  await supabaseRest(
    supabaseUrl,
    serviceKey,
    `groups?id=eq.${encodeURIComponent(groupId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ current_members: newCount, is_full: isFull }),
    },
  );
}

async function handleLeave(supabaseUrl: string, serviceKey: string, groupId: string, userId: string) {
  await supabaseRest(
    supabaseUrl,
    serviceKey,
    `group_members?group_id=eq.${encodeURIComponent(groupId)}&user_id=eq.${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
    },
  );

  const groupResponse = await supabaseRest(
    supabaseUrl,
    serviceKey,
    `groups?select=current_members,max_members&id=eq.${encodeURIComponent(groupId)}&limit=1`,
  );
  const group = await groupResponse.json();
  if (!groupResponse.ok || !group || group.length === 0) {
    throw new Error("Failed to fetch group");
  }

  const newCount = Math.max(0, (group[0]?.current_members || 0) - 1);
  const isFull = newCount >= (group[0]?.max_members || 1);

  await supabaseRest(
    supabaseUrl,
    serviceKey,
    `groups?id=eq.${encodeURIComponent(groupId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ current_members: newCount, is_full: isFull }),
    },
  );
}

async function handleUpdate(supabaseUrl: string, serviceKey: string, groupId: string, updates: any, userId: string, isAdmin: boolean) {
  if (updates.name !== undefined && (!updates.name || typeof updates.name !== 'string' || updates.name.trim().length < 3)) {
    throw new Error('اسم المجموعة مطلوب (3 أحرف على الأقل)');
  }
  if (updates.max_members !== undefined && (updates.max_members < 2 || updates.max_members > 20)) {
    throw new Error('عدد الأعضاء يجب أن يكون بين 2 و 20');
  }
  if (updates.whatsapp_link !== undefined && !updates.whatsapp_link) {
    throw new Error('رابط الواتساب مطلوب');
  }
  if (updates.whatsapp_link && !validateUrl(updates.whatsapp_link)) {
    throw new Error('رابط الواتساب غير صالح');
  }
  if (updates.group_link && !validateUrl(updates.group_link)) {
    throw new Error('رابط المجموعة غير صالح');
  }

  const groupResponse = await supabaseRest(
    supabaseUrl,
    serviceKey,
    `groups?select=creator_id,current_members,max_members&id=eq.${encodeURIComponent(groupId)}&limit=1`,
  );
  const group = await groupResponse.json();
  if (!groupResponse.ok || !group || group.length === 0) {
    throw new Error('المجموعة غير موجودة');
  }

  if (!isAdmin && group[0]?.creator_id !== userId) {
    throw new Error('غير مخول لتعديل هذه المجموعة');
  }

  if (updates.max_members !== undefined && updates.max_members < (group[0]?.current_members || 0)) {
    throw new Error(`لا يمكن تحديد عدد أعضاء أقل من العدد الحالي (${group[0]?.current_members || 0})`);
  }

  const isFull = updates.max_members !== undefined
    ? updates.max_members <= (group[0]?.current_members || 0)
    : (group[0]?.max_members || 0) <= (group[0]?.current_members || 0);

  const updateBody = { ...updates, is_full: isFull };

  const updateResponse = await supabaseRest(
    supabaseUrl,
    serviceKey,
    `groups?select=*&id=eq.${encodeURIComponent(groupId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(updateBody),
    },
  );

  const data = await updateResponse.json();
  if (!updateResponse.ok) throw new Error(data?.message || "Update failed");
  return data[0];
}

async function handleDelete(supabaseUrl: string, serviceKey: string, groupId: string, userId: string, isAdmin: boolean) {
  const groupResponse = await supabaseRest(
    supabaseUrl,
    serviceKey,
    `groups?select=creator_id&id=eq.${encodeURIComponent(groupId)}&limit=1`,
  );
  const group = await groupResponse.json();
  if (!groupResponse.ok || !group || group.length === 0) {
    throw new Error('المجموعة غير موجودة');
  }

  if (!isAdmin && group[0]?.creator_id !== userId) {
    throw new Error('غير مخول لحذف هذه المجموعة');
  }

  await supabaseRest(
    supabaseUrl,
    serviceKey,
    `group_members?group_id=eq.${encodeURIComponent(groupId)}`,
    {
      method: "DELETE",
    },
  );

  const deleteResponse = await supabaseRest(
    supabaseUrl,
    serviceKey,
    `groups?id=eq.${encodeURIComponent(groupId)}`,
    {
      method: "DELETE",
    },
  );

  if (!deleteResponse.ok) {
    const errorData = await deleteResponse.json().catch(() => ({}));
    throw new Error(errorData?.message || "Failed to delete group");
  }
}

async function handleGetMembers(supabaseUrl: string, serviceKey: string, groupId: string, userId: string) {
  if (!userId) throw new Error("Unauthorized");

  const response = await supabaseRest(
    supabaseUrl,
    serviceKey,
    `group_members?select=id,user_id,joined_at&group_id=eq.${encodeURIComponent(groupId)}`,
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || "Failed to fetch members");
  return data || [];
}

async function handleCheckMembership(supabaseUrl: string, serviceKey: string, groupId: string, userId: string) {
  const response = await supabaseRest(
    supabaseUrl,
    serviceKey,
    `group_members?select=id&group_id=eq.${encodeURIComponent(groupId)}&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
  );
  const data = await response.json();
  return !!(data && data.length > 0);
}

async function handleCheckIsAdmin(supabaseUrl: string, serviceKey: string, userId: string) {
  try {
    const response = await supabaseRest(
      supabaseUrl,
      serviceKey,
      `profiles?select=role&id=eq.${encodeURIComponent(userId)}&limit=1`,
    );
    const data = await response.json();
    return data?.[0]?.role === 'admin';
  } catch {
    return false;
  }
}

async function handleGetCoursesByMajor(supabaseUrl: string, serviceKey: string, major: string): Promise<Course[]> {
  try {
    const res = await fetch("https://raw.githubusercontent.com/svu-community/svu-courses/main/svu_courses.json");
    if (res.ok) {
      const catalog: Record<string, { name: string; code: string }[]> = await res.json();
      const raw = catalog[major];
      if (raw) return raw.map((c) => ({ code: c.code, name: c.name }));
    }
  } catch {}

  const response = await supabaseRest(
    supabaseUrl,
    serviceKey,
    `groups?select=course_code,course_name&major=eq.${encodeURIComponent(major)}`,
  );
  const data = await response.json();
  if (!response.ok) return [];
  return [...new Map(data.map((g: any) => [g.course_code, { code: g.course_code, name: g.course_name }]))]
    .map(([_, v]) => v as Course);
}

async function handleGetAvailableMajors(supabaseUrl: string, serviceKey: string): Promise<string[]> {
  const response = await supabaseRest(
    supabaseUrl,
    serviceKey,
    `groups?select=major`,
  );
  const data = await response.json();
  if (!response.ok) return [];
  return [...new Set(data.map((g: any) => g.major).filter(Boolean))].sort();
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

  const supabaseAdmin = { url: supabaseUrl, key: supabaseServiceKey };
  const clientIp = getClientIp(req);
  const rateLimit = await checkRateLimit(supabaseAdmin.url, supabaseAdmin.key, `study-groups:${clientIp}`);
  if (!rateLimit.allowed) {
    return jsonResponse({ error: "Rate limit exceeded", retryAfterMs: rateLimit.retryAfterMs }, 429, origin);
  }

  const userId = await getAuthUserId(req, supabaseAdmin.url, supabaseAdmin.key);
  const isAdmin = userId ? await handleCheckIsAdmin(supabaseAdmin.url, supabaseAdmin.key, userId) : false;

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
        result = await handleGetAll(supabaseAdmin.url, supabaseAdmin.key, userId);
        break;
      case "getMyGroups":
        if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
        result = await handleGetMyGroups(supabaseAdmin.url, supabaseAdmin.key, userId);
        break;
      case "create":
        if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
        result = await handleCreate(supabaseAdmin.url, supabaseAdmin.key, payload, userId);
        break;
      case "join":
        if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
        await handleJoin(supabaseAdmin.url, supabaseAdmin.key, payload.groupId, userId);
        result = { success: true };
        break;
      case "leave":
        if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
        await handleLeave(supabaseAdmin.url, supabaseAdmin.key, payload.groupId, userId);
        result = { success: true };
        break;
      case "update":
        if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
        result = await handleUpdate(supabaseAdmin.url, supabaseAdmin.key, payload.groupId, payload.updates, userId, isAdmin);
        break;
      case "delete":
        if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
        await handleDelete(supabaseAdmin.url, supabaseAdmin.key, payload.groupId, userId, isAdmin);
        result = { success: true };
        break;
      case "getMembers":
        if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
        result = await handleGetMembers(supabaseAdmin.url, supabaseAdmin.key, payload.groupId, userId);
        break;
      case "checkMembership":
        if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
        result = await handleCheckMembership(supabaseAdmin.url, supabaseAdmin.key, payload.groupId, userId);
        break;
      case "checkIsAdmin":
        if (!userId) return jsonResponse({ error: "Unauthorized" }, 401, origin);
        result = await handleCheckIsAdmin(supabaseAdmin.url, supabaseAdmin.key, userId);
        break;
      case "getCoursesByMajor":
        result = await handleGetCoursesByMajor(supabaseAdmin.url, supabaseAdmin.key, payload.major);
        break;
      case "getAvailableMajors":
        result = await handleGetAvailableMajors(supabaseAdmin.url, supabaseAdmin.key);
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
