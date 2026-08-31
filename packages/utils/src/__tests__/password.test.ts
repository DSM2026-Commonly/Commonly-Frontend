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
  changeInitialPassword,
  requiresInitialPasswordChange,
} from "../password";

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
  test("true only for the initial-password 403", async () => {
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
