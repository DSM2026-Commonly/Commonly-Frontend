import { afterEach, describe, expect, test } from "bun:test";
import {
  ApiError,
  SERVER_ERROR_MESSAGE,
  UNAUTHORIZED_EVENT,
  request,
} from "../api";

const originalFetch = globalThis.fetch;

function mockFetch(status: number, body?: unknown) {
  globalThis.fetch = (async () =>
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })) as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("request error messages", () => {
  test("prefers the mapped message for a known status", async () => {
    mockFetch(400, { status: 400, message: "백엔드 메시지" });

    await expect(
      request("/x", { errorMessages: { 400: "매핑 문구" } }),
    ).rejects.toMatchObject({ status: 400, message: "매핑 문구" });
  });

  test("falls back to the backend message when the status is not mapped", async () => {
    mockFetch(400, { status: 400, timestamp: "t", message: "생년월일 형식이 올바르지 않습니다." });

    await expect(request("/x")).rejects.toMatchObject({
      status: 400,
      message: "생년월일 형식이 올바르지 않습니다.",
    });
  });

  test("uses the generic message when the backend message is blank", async () => {
    mockFetch(400, { status: 400, message: "   " });

    await expect(request("/x")).rejects.toMatchObject({
      message: SERVER_ERROR_MESSAGE,
    });
  });

  test("uses the generic message when the body has no message", async () => {
    mockFetch(500);

    const error = await request("/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).message).toBe(SERVER_ERROR_MESSAGE);
  });

  test("dispatches the unauthorized event on 401", async () => {
    mockFetch(401, { status: 401, message: "인증 실패" });

    const dispatched = await countUnauthorizedEvents(null);

    expect(dispatched).toBe(1);
  });

  test("dispatches the unauthorized event when the stored token is expired", async () => {
    mockFetch(401, { status: 401, message: "인증 실패" });

    const dispatched = await countUnauthorizedEvents(
      createToken(Date.now() / 1000 - 60),
    );

    expect(dispatched).toBe(1);
  });

  // 백엔드는 권한 부족에도 401 을 준다. 토큰이 살아 있으면 로그아웃시키면 안 된다.
  test("keeps the session when the stored token is still valid", async () => {
    mockFetch(401, { status: 401, message: "권한 없음" });

    const dispatched = await countUnauthorizedEvents(
      createToken(Date.now() / 1000 + 600),
    );

    expect(dispatched).toBe(0);
  });
});

function createToken(expiresAtSeconds: number): string {
  const payload = btoa(JSON.stringify({ sub: "tester", exp: Math.floor(expiresAtSeconds) }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `header.${payload}.signature`;
}

/** 저장된 토큰을 둔 채 401 요청을 한 번 보내고 unauthorized 이벤트 발생 횟수를 센다. */
async function countUnauthorizedEvents(token: string | null): Promise<number> {
  let dispatched = 0;
  const fakeWindow = new EventTarget() as EventTarget & {
    localStorage?: unknown;
  };

  fakeWindow.localStorage = {
    getItem: (key: string) => (key === "token" ? token : null),
    setItem: () => undefined,
    removeItem: () => undefined,
  };
  fakeWindow.addEventListener(UNAUTHORIZED_EVENT, () => void dispatched++);
  (globalThis as { window?: unknown }).window = fakeWindow;

  try {
    await expect(request("/x")).rejects.toMatchObject({ status: 401 });
  } finally {
    delete (globalThis as { window?: unknown }).window;
  }

  return dispatched;
}
