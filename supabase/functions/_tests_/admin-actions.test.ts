import { describe, it, assertEquals, assertRejects, beforeEach, mock } from './deps.ts';
import { verifyCaller, jsonResponse, corsHeaders } from '../admin-actions/index.ts';

const createMockUserClient = () => ({
  auth: {
    getUser: mock(() => Promise.resolve({ data: { user: null }, error: null })),
  },
  from: mock(() => ({
    select: mock(() => ({
      eq: mock(() => ({
        maybeSingle: mock(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  })),
});

describe('Security: CVE-002 — Origin Allowlist', () => {
  let previousOrigin;

  beforeEach(() => {
    previousOrigin = Deno.env.get('ALLOWED_ORIGIN');
  });

  afterEach(() => {
    if (previousOrigin !== undefined) {
      Deno.env.set('ALLOWED_ORIGIN', previousOrigin);
    } else {
      Deno.env.delete('ALLOWED_ORIGIN');
    }
  });

  it('OPTIONS returns 200 with CORS headers', async () => {
    Deno.env.set('ALLOWED_ORIGIN', 'https://example.com');
    const req = new Request('http://localhost/api/admin', { method: 'OPTIONS' });
    const mod = await import('../admin-actions/index.ts');
    const response = (await (mod as any).default(req)) as Response;
    assertEquals(response.status, 200);
    assertEquals(response.headers.get('Access-Control-Allow-Origin'), 'https://example.com');
  });

  it('POST without authorization returns 401', async () => {
    Deno.env.set('ALLOWED_ORIGIN', 'https://example.com');
    const req = new Request('http://localhost/api/admin', {
      method: 'POST',
      headers: { Origin: 'https://evil.com' },
      body: JSON.stringify({}),
    });
    const mod = await import('../admin-actions/index.ts');
    const response = (await (mod as any).default(req)) as Response;
    assertEquals(response.status, 401);
    assertEquals(response.headers.get('Access-Control-Allow-Origin'), 'https://example.com');
  });

  it('POST with valid Bearer but wrong role returns 403', async () => {
    Deno.env.set('ALLOWED_ORIGIN', 'https://example.com');
    const client = createMockUserClient();
    client.auth.getUser.mockImplementationOnce(() =>
      Promise.resolve({
        data: { user: { id: 'user-2' } },
        error: null,
      })
    );
    client.from.mockImplementationOnce(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () =>
            Promise.resolve({
              data: { id: 'user-2', is_admin: false, is_active: true },
              error: null,
            }),
        }),
      }),
    }));

    const req = new Request('http://localhost/api/admin', {
      method: 'POST',
      headers: {
        Origin: 'https://example.com',
        authorization: 'Bearer good-token',
      },
      body: JSON.stringify({ action: 'sendEmail', payload: {} }),
    });

    const mod = await import('../admin-actions/index.ts');
    const mocked = (mod as any).default as any;
    const response = await mocked(req);
    assertEquals(response.status, 403);
  });

  it('corsHeaders uses ALLOWED_ORIGIN env var', async () => {
    Deno.env.set('ALLOWED_ORIGIN', 'https://trusted.com');
    const mod = await import('../admin-actions/index.ts');
    assertEquals(mod.corsHeaders['Access-Control-Allow-Origin'], 'https://trusted.com');
  });
});

describe('Security: CVE-001 — Bearer Token', () => {
  it('verifyCaller rejects missing auth header', async () => {
    const client = createMockUserClient();
    const result = await verifyCaller(client, '');
    assertEquals(result.ok, false);
    assertEquals(result.status, 401);
    assertEquals(result.error, 'authorization_required');
  });

  it('verifyCaller rejects malformed header', async () => {
    const client = createMockUserClient();
    const result = await verifyCaller(client, 'Token abc');
    assertEquals(result.ok, false);
    assertEquals(result.status, 401);
    assertEquals(result.error, 'authorization_required');
  });

  it('verifyCaller rejects invalid token', async () => {
    const client = createMockUserClient();
    client.auth.getUser.mockImplementationOnce(() =>
      Promise.resolve({
        data: { user: null },
        error: { message: 'JWT expired' },
      })
    );
    const result = await verifyCaller(client, 'Bearer bad-token');
    assertEquals(result.ok, false);
    assertEquals(result.status, 401);
    assertEquals(result.error, 'invalid_token');
  });

  it('verifyCaller rejects missing profile', async () => {
    const client = createMockUserClient();
    client.auth.getUser.mockImplementationOnce(() =>
      Promise.resolve({
        data: { user: { id: 'user-1' } },
        error: null,
      })
    );
    client.from.mockImplementationOnce(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }));
    const result = await verifyCaller(client, 'Bearer token-without-profile');
    assertEquals(result.ok, false);
    assertEquals(result.status, 401);
    assertEquals(result.error, 'profile_not_found');
  });

  it('verifyCaller accepts valid admin token', async () => {
    const client = createMockUserClient();
    client.auth.getUser.mockImplementationOnce(() =>
      Promise.resolve({
        data: { user: { id: 'user-1' } },
        error: null,
      })
    );
    client.from.mockImplementationOnce(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () =>
            Promise.resolve({
              data: { id: 'user-1', is_admin: true, is_active: true },
              error: null,
            }),
        }),
      }),
    }));
    const result = await verifyCaller(client, 'Bearer valid-token');
    assertEquals(result.ok, true);
    assertEquals(result.data.id, 'user-1');
    assertEquals(result.data.is_admin, true);
  });
});

describe('Security: jsonResponse always includes CORS on non-OPTIONS', () => {
  it('success response has CORS headers', async () => {
    const response = jsonResponse(200, { ok: true });
    assertEquals(response.status, 200);
    const body = await response.json();
    assertEquals(body, { ok: true });
    assertEquals(response.headers.get('Access-Control-Allow-Origin'), '');
    assertEquals(response.headers.get('Content-Type'), 'application/json');
  });
});
