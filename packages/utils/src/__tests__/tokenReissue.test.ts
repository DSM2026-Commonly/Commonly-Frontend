import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  REISSUE_ENDPOINT,
  SESSION_EXTEND_FAILED_MESSAGE,
  UNAUTHORIZED_EVENT,
  reissueAuthToken,
  request,
} from "../api";
import {
  AUTH_TOKEN_CHANGED_EVENT,
  AUTH_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from "../auth";

const originalFetch = globalThis.fetch;

/** 계정(sub)이 담긴 JWT 모양의 토큰. 서명은 검증하지 않으므로 아무 값이나 둔다. */
function jwt(subject: string, label: string): string {
  const encode = (value: unknown) =>
    btoa(JSON.stringify(value))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  return `${encode({ alg: "HS256" })}.${encode({ sub: subject, jti: label })}.sig`;
}

const OLD_ACCESS = jwt("staff01", "old");
const NEW_ACCESS = jwt("staff01", "new");
const OTHER_TAB_ACCESS = jwt("staff01", "other-tab");
const OTHER_ACCOUNT_ACCESS = jwt("staff02", "other-account");

let storage: Map<string, string>;
let events: string[];

interface RecordedCall {
  url: string;
  authorization?: string;
  body?: unknown;
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** 경로별 응답을 차례로 돌려주고 호출 내역을 남긴다. */
function mockRoutes(routes: Record<string, Array<() => Response>>) {
  const calls: RecordedCall[] = [];
  const counts = new Map<string, number>();

  globalThis.fetch = (async (input: unknown, init?: RequestInit) => {
    const url = String(input);
    const headers = (init?.headers ?? {}) as Record<string, string>;
    const responses = routes[url];

    calls.push({
      url,
      authorization: headers.Authorization,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    });

    if (!responses) {
      throw new Error(`unexpected request: ${url}`);
    }

    const count = counts.get(url) ?? 0;
    counts.set(url, count + 1);

    return responses[Math.min(count, responses.length - 1)]();
  }) as unknown as typeof fetch;

  return calls;
}

beforeEach(() => {
  storage = new Map();
  events = [];

  const fakeWindow = new EventTarget() as EventTarget & {
    localStorage?: unknown;
  };

  fakeWindow.localStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => void storage.set(key, value),
    removeItem: (key: string) => void storage.delete(key),
  };
  fakeWindow.addEventListener(UNAUTHORIZED_EVENT, () => void events.push("unauthorized"));
  fakeWindow.addEventListener(AUTH_TOKEN_CHANGED_EVENT, () => void events.push("token-changed"));
  (globalThis as { window?: unknown }).window = fakeWindow;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  delete (globalThis as { window?: unknown }).window;
});

const expiredToken = () =>
  json(401, { code: "EXPIRED_TOKEN", status: 401, message: "만료된 토큰입니다." });

describe("reissueAuthToken", () => {
  test("stores the rotated token pair and announces the change", async () => {
    storage.set(AUTH_TOKEN_STORAGE_KEY, OLD_ACCESS);
    storage.set(REFRESH_TOKEN_STORAGE_KEY, "old-refresh");
    const calls = mockRoutes({
      [REISSUE_ENDPOINT]: [
        () => json(200, { accessToken: NEW_ACCESS, refreshToken: "new-refresh" }),
      ],
    });

    expect(await reissueAuthToken()).toBe(NEW_ACCESS);
    expect(calls[0].body).toEqual({ refreshToken: "old-refresh" });
    expect(calls[0].authorization).toBeUndefined();
    expect(storage.get(AUTH_TOKEN_STORAGE_KEY)).toBe(NEW_ACCESS);
    expect(storage.get(REFRESH_TOKEN_STORAGE_KEY)).toBe("new-refresh");
    expect(events).toContain("token-changed");
  });

  test("sends a single request when called concurrently", async () => {
    storage.set(REFRESH_TOKEN_STORAGE_KEY, "refresh");
    const calls = mockRoutes({
      [REISSUE_ENDPOINT]: [
        () => json(200, { accessToken: "a", refreshToken: "r" }),
      ],
    });

    const [first, second] = await Promise.all([
      reissueAuthToken(),
      reissueAuthToken(),
    ]);

    expect(first).toBe("a");
    expect(second).toBe("a");
    expect(calls).toHaveLength(1);
  });

  test("fails without ending the session and drops a rejected refresh token", async () => {
    storage.set(AUTH_TOKEN_STORAGE_KEY, OLD_ACCESS);
    storage.set(REFRESH_TOKEN_STORAGE_KEY, "used-refresh");
    mockRoutes({
      [REISSUE_ENDPOINT]: [
        () =>
          json(401, {
            code: "REFRESH_TOKEN_NOT_FOUND",
            status: 401,
            message: "이미 사용되었거나 무효화된 리프레시 토큰입니다.",
          }),
      ],
    });

    await expect(reissueAuthToken()).rejects.toMatchObject({
      status: 401,
      message: SESSION_EXTEND_FAILED_MESSAGE,
    });
    expect(storage.get(AUTH_TOKEN_STORAGE_KEY)).toBe(OLD_ACCESS);
    expect(storage.has(REFRESH_TOKEN_STORAGE_KEY)).toBe(false);
    expect(events).not.toContain("unauthorized");
  });

  test("keeps a refresh token that another tab stored meanwhile", async () => {
    storage.set(REFRESH_TOKEN_STORAGE_KEY, "used-refresh");
    mockRoutes({
      [REISSUE_ENDPOINT]: [
        () => {
          storage.set(REFRESH_TOKEN_STORAGE_KEY, "other-tab-refresh");
          return json(401, { code: "REFRESH_TOKEN_NOT_FOUND", status: 401 });
        },
      ],
    });

    await reissueAuthToken().catch(() => undefined);

    expect(storage.get(REFRESH_TOKEN_STORAGE_KEY)).toBe("other-tab-refresh");
  });

  test("does not restore the session when the user logged out meanwhile", async () => {
    storage.set(AUTH_TOKEN_STORAGE_KEY, OLD_ACCESS);
    storage.set(REFRESH_TOKEN_STORAGE_KEY, "refresh");
    mockRoutes({
      [REISSUE_ENDPOINT]: [
        () => {
          // 응답을 기다리는 사이 로그아웃했다.
          storage.clear();
          return json(200, { accessToken: NEW_ACCESS, refreshToken: "new-refresh" });
        },
      ],
    });

    await expect(reissueAuthToken()).rejects.toMatchObject({
      message: SESSION_EXTEND_FAILED_MESSAGE,
    });
    expect(storage.size).toBe(0);
  });

  test("fails fast when no refresh token is stored", async () => {
    const calls = mockRoutes({});

    await expect(reissueAuthToken()).rejects.toMatchObject({
      message: SESSION_EXTEND_FAILED_MESSAGE,
    });
    expect(calls).toHaveLength(0);
  });
});

describe("request retry on an expired access token", () => {
  test("reissues once and resends with the new token", async () => {
    storage.set(AUTH_TOKEN_STORAGE_KEY, OLD_ACCESS);
    storage.set(REFRESH_TOKEN_STORAGE_KEY, "refresh");
    const calls = mockRoutes({
      "/x": [expiredToken, () => json(200, { ok: true })],
      [REISSUE_ENDPOINT]: [
        () => json(200, { accessToken: NEW_ACCESS, refreshToken: "new-refresh" }),
      ],
    });

    expect(await request("/x", { token: OLD_ACCESS })).toEqual({ ok: true });
    expect(calls.map((call) => [call.url, call.authorization])).toEqual([
      ["/x", `Bearer ${OLD_ACCESS}`],
      [REISSUE_ENDPOINT, undefined],
      ["/x", `Bearer ${NEW_ACCESS}`],
    ]);
    expect(events).not.toContain("unauthorized");
  });

  test("uses a token another tab already refreshed instead of reissuing", async () => {
    storage.set(AUTH_TOKEN_STORAGE_KEY, OTHER_TAB_ACCESS);
    storage.set(REFRESH_TOKEN_STORAGE_KEY, "refresh");
    const calls = mockRoutes({
      "/x": [expiredToken, () => json(200, { ok: true })],
    });

    expect(await request("/x", { token: OLD_ACCESS })).toEqual({ ok: true });
    expect(calls.map((call) => call.authorization)).toEqual([
      `Bearer ${OLD_ACCESS}`,
      `Bearer ${OTHER_TAB_ACCESS}`,
    ]);
  });

  test("ends the session when the token cannot be reissued", async () => {
    storage.set(AUTH_TOKEN_STORAGE_KEY, OLD_ACCESS);
    const calls = mockRoutes({ "/x": [expiredToken] });

    await expect(request("/x", { token: OLD_ACCESS })).rejects.toMatchObject({
      status: 401,
    });
    expect(calls).toHaveLength(1);
    expect(events).toContain("unauthorized");
  });

  test("does not resend with another account's token", async () => {
    // 이전 계정으로 보낸 요청이 만료되는 사이 다른 계정으로 로그인했다.
    storage.set(AUTH_TOKEN_STORAGE_KEY, OTHER_ACCOUNT_ACCESS);
    storage.set(REFRESH_TOKEN_STORAGE_KEY, "other-account-refresh");
    const calls = mockRoutes({ "/x": [expiredToken] });

    await expect(request("/x", { token: OLD_ACCESS })).rejects.toMatchObject({
      status: 401,
    });
    expect(calls).toHaveLength(1);
    // 지금 로그인한 계정의 세션은 끝내지 않는다.
    expect(events).not.toContain("unauthorized");
    expect(storage.get(AUTH_TOKEN_STORAGE_KEY)).toBe(OTHER_ACCOUNT_ACCESS);
  });

  test("does not retry other 401s", async () => {
    storage.set(AUTH_TOKEN_STORAGE_KEY, "access");
    storage.set(REFRESH_TOKEN_STORAGE_KEY, "refresh");
    const calls = mockRoutes({
      "/x": [
        () => json(401, { code: "PASSWORD_MISMATCH", status: 401, message: "불일치" }),
      ],
    });

    await expect(request("/x", { token: "access" })).rejects.toMatchObject({
      status: 401,
    });
    expect(calls).toHaveLength(1);
  });
});
