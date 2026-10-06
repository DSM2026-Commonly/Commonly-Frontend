import { describe, expect, test } from "bun:test";
import {
  ApiError,
  INITIAL_PASSWORD_NOT_CHANGED_MESSAGE,
  PASSWORD_CHANGE_REQUIRED_EVENT,
  request,
} from "../api";
import {
  INITIAL_PASSWORD_CHANGE_BAD_REQUEST_MESSAGE,
  INITIAL_PASSWORD_CHANGE_ENDPOINT,
  PASSWORD_CHANGE_BAD_REQUEST_MESSAGE,
  PASSWORD_CHANGE_FORBIDDEN_MESSAGE,
  PASSWORD_CHANGE_UNAUTHORIZED_MESSAGE,
  changeInitialPassword,
  changePassword,
  requiresInitialPasswordChange,
} from "../password";
import { ME_ENDPOINT } from "../users";

function mockFetch(
  status: number,
  body?: unknown,
  onRequest?: (url: string, init?: RequestInit) => void,
) {
  globalThis.fetch = (async (url: unknown, init?: RequestInit) => {
    onRequest?.(String(url), init);
    return new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
}

/** 경로별로 다른 응답을 준다. 호출된 경로를 순서대로 기록한다. */
function mockFetchByPath(
  responses: Record<string, { status: number; body?: unknown }>,
  requestedPaths: string[] = [],
) {
  globalThis.fetch = (async (url: unknown) => {
    const path = String(url).split("?")[0];
    requestedPaths.push(path);
    const { status, body } = responses[path] ?? { status: 404 };
    return new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  return requestedPaths;
}

const staffMe = {
  userId: 7,
  accountId: "staff01",
  name: "김담당",
  authority: "USER",
  passwordChanged: true,
  department: "민원과",
  phoneNumber: null,
  birthDate: null,
};

describe("changeInitialPassword", () => {
  test("PATCH with bearer token and password body", async () => {
    let requestedUrl = "";
    let method: string | undefined;
    let sentBody: string | undefined;
    let authorization: string | undefined;
    mockFetch(200, undefined, (url, init) => {
      requestedUrl = url;
      method = init?.method;
      sentBody = init?.body as string;
      authorization = (init?.headers as Record<string, string> | undefined)
        ?.Authorization;
    });

    await changeInitialPassword({ password: "newpass123" }, { token: "t" });

    expect(requestedUrl).toBe(INITIAL_PASSWORD_CHANGE_ENDPOINT);
    expect(method).toBe("PATCH");
    expect(JSON.parse(sentBody ?? "{}")).toEqual({ password: "newpass123" });
    expect(authorization).toBe("Bearer t");
  });

  test("400 maps to format message", async () => {
    mockFetch(400, { status: 400, message: "x" });
    const error = await changeInitialPassword({ password: "short" }).catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).message).toBe(
      INITIAL_PASSWORD_CHANGE_BAD_REQUEST_MESSAGE,
    );
  });
});

describe("changePassword", () => {
  test("PATCHes the user's password path with current and new password", async () => {
    let requestedUrl = "";
    let method: string | undefined;
    let sentBody: string | undefined;
    let authorization: string | undefined;
    mockFetch(200, undefined, (url, init) => {
      requestedUrl = url;
      method = init?.method;
      sentBody = init?.body as string;
      authorization = (init?.headers as Record<string, string> | undefined)
        ?.Authorization;
    });

    await changePassword(
      7,
      { password: "current123", newPassword: "newpass123" },
      { token: "t" },
    );

    expect(requestedUrl).toBe("/api/auths/password/7");
    expect(method).toBe("PATCH");
    expect(JSON.parse(sentBody ?? "{}")).toEqual({
      password: "current123",
      newPassword: "newpass123",
    });
    expect(authorization).toBe("Bearer t");
  });

  test("401 (wrong current password) maps to the current-password message", async () => {
    mockFetch(401, {
      status: 401,
      timestamp: "t",
      message: "아이디 또는 비밀번호가 일치하지 않습니다.",
    });

    const error = await changePassword(7, {
      password: "wrong",
      newPassword: "newpass123",
    }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
    expect((error as ApiError).message).toBe(
      PASSWORD_CHANGE_UNAUTHORIZED_MESSAGE,
    );
  });

  test("403 (not my account) maps to the own-account message", async () => {
    mockFetch(403, {
      status: 403,
      timestamp: "t",
      message: "본인의 계정만 변경할 수 있습니다.",
    });

    const error = await changePassword(8, {
      password: "current123",
      newPassword: "newpass123",
    }).catch((e: unknown) => e);

    expect((error as ApiError).status).toBe(403);
    expect((error as ApiError).message).toBe(PASSWORD_CHANGE_FORBIDDEN_MESSAGE);
  });

  test("400 shows the backend field messages, or the format message without them", async () => {
    mockFetch(400, {
      status: 400,
      timestamp: "t",
      error: { newPassword: "비밀번호는 8자 이상 72자 이하여야 합니다." },
    });

    const fieldError = await changePassword(7, {
      password: "current123",
      newPassword: "short",
    }).catch((e: unknown) => e);

    expect((fieldError as ApiError).message).toBe(
      "비밀번호는 8자 이상 72자 이하여야 합니다.",
    );

    mockFetch(400, { status: 400, timestamp: "t" });

    const plainError = await changePassword(7, {
      password: "current123",
      newPassword: "short",
    }).catch((e: unknown) => e);

    expect((plainError as ApiError).message).toBe(
      PASSWORD_CHANGE_BAD_REQUEST_MESSAGE,
    );
  });
});

describe("initial password 403 detection", () => {
  test("dispatches password-change-required event and keeps backend message", async () => {
    const events: string[] = [];
    const originalWindow = globalThis.window;
    // request() 는 window 가 있을 때만 이벤트를 발행한다.
    (globalThis as { window?: unknown }).window = {
      dispatchEvent: (event: Event) => {
        events.push(event.type);
        return true;
      },
    };

    try {
      mockFetch(403, {
        status: 403,
        timestamp: "t",
        message: INITIAL_PASSWORD_NOT_CHANGED_MESSAGE,
      });
      const error = await request("/api/admins", {
        errorMessages: { 403: "다른 문구" },
      }).catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(403);
      expect((error as ApiError).message).toBe(
        INITIAL_PASSWORD_NOT_CHANGED_MESSAGE,
      );
      expect(events).toEqual([PASSWORD_CHANGE_REQUIRED_EVENT]);
    } finally {
      (globalThis as { window?: unknown }).window = originalWindow;
    }
  });

  test("other 403s do not dispatch the event", async () => {
    const events: string[] = [];
    const originalWindow = globalThis.window;
    (globalThis as { window?: unknown }).window = {
      dispatchEvent: (event: Event) => {
        events.push(event.type);
        return true;
      },
    };

    try {
      mockFetch(403, { status: 403, message: "권한 없음" });
      await request("/api/admins").catch(() => undefined);
      expect(events).toEqual([]);
    } finally {
      (globalThis as { window?: unknown }).window = originalWindow;
    }
  });
});

describe("requiresInitialPasswordChange", () => {
  test("uses passwordChanged from /api/users/me without probing", async () => {
    const requestedPaths = mockFetchByPath({
      [ME_ENDPOINT]: { status: 200, body: { ...staffMe, passwordChanged: false } },
    });
    expect(await requiresInitialPasswordChange({ token: "t" })).toBe(true);
    expect(requestedPaths).toEqual([ME_ENDPOINT]);

    mockFetchByPath({ [ME_ENDPOINT]: { status: 200, body: staffMe } });
    expect(await requiresInitialPasswordChange({ token: "t" })).toBe(false);
  });

  test("never redirects a petitioner", async () => {
    mockFetchByPath({
      [ME_ENDPOINT]: {
        status: 200,
        body: { ...staffMe, authority: "PETITIONER", passwordChanged: false },
      },
    });
    expect(await requiresInitialPasswordChange({ token: "t" })).toBe(false);
  });

  test("falls back to the 403 probe when /api/users/me fails", async () => {
    const requestedPaths = mockFetchByPath({
      [ME_ENDPOINT]: { status: 404, body: { status: 404, message: "없음" } },
      "/api/issuance-histories": {
        status: 403,
        body: { status: 403, message: INITIAL_PASSWORD_NOT_CHANGED_MESSAGE },
      },
    });
    expect(await requiresInitialPasswordChange({ token: "t" })).toBe(true);
    expect(requestedPaths).toEqual([ME_ENDPOINT, "/api/issuance-histories"]);

    mockFetchByPath({
      [ME_ENDPOINT]: { status: 500 },
      "/api/issuance-histories": {
        status: 200,
        body: { content: [], totalElements: 0, totalPages: 0 },
      },
    });
    expect(await requiresInitialPasswordChange({ token: "t" })).toBe(false);
  });

  test("with me unavailable, true only for the initial-password 403", async () => {
    mockFetch(403, { status: 403, message: INITIAL_PASSWORD_NOT_CHANGED_MESSAGE });
    expect(await requiresInitialPasswordChange({ token: "t" })).toBe(true);

    mockFetch(403, { status: 403, message: "권한 없음" });
    expect(await requiresInitialPasswordChange({ token: "t" })).toBe(false);

    mockFetch(200, []);
    expect(await requiresInitialPasswordChange({ token: "t" })).toBe(false);

    mockFetch(500);
    expect(await requiresInitialPasswordChange({ token: "t" })).toBe(false);
  });
});
