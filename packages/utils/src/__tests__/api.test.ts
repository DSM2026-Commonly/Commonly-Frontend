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

  test("prefers the validation error map over the mapped status message", async () => {
    // 검증 실패 응답은 {status, timestamp, error: {필드: 문구}} 로 최상위 message 가 없다.
    mockFetch(400, {
      status: 400,
      timestamp: "t",
      error: { divisionValid: "구분 값은 채용/전보/해지/퇴직 중 하나여야 합니다." },
    });

    const error = await request("/x", {
      errorMessages: { 400: "입력값이 올바르지 않습니다." },
    }).catch((e: unknown) => e);

    expect((error as ApiError).message).toBe(
      "구분 값은 채용/전보/해지/퇴직 중 하나여야 합니다.",
    );
    expect((error as ApiError).fieldErrors).toEqual({
      divisionValid: "구분 값은 채용/전보/해지/퇴직 중 하나여야 합니다.",
    });
  });

  test("joins several field messages in a stable order", async () => {
    mockFetch(400, {
      status: 400,
      error: { gender: "널이어서는 안됩니다", divisionValid: "구분 값이 틀립니다" },
    });

    await expect(request("/x")).rejects.toMatchObject({
      message: "구분 값이 틀립니다 널이어서는 안됩니다",
    });
  });

  test("ignores an error field that is not a message map", async () => {
    for (const body of [
      { status: 400, error: "Bad Request" },
      { status: 400, error: [] },
      { status: 400, error: {} },
      { status: 400, error: { field: "  " } },
    ]) {
      mockFetch(400, body);

      const error = await request("/x").catch((e: unknown) => e);
      expect((error as ApiError).message).toBe(SERVER_ERROR_MESSAGE);
      expect((error as ApiError).fieldErrors).toBeUndefined();
    }
  });

  test("keeps the body code mapping ahead of the validation error map", async () => {
    mockFetch(400, {
      code: "DIVISION_INVALID",
      error: { divisionValid: "백엔드 문구" },
    });

    await expect(
      request("/x", { errorMessages: { DIVISION_INVALID: "화면 문구" } }),
    ).rejects.toMatchObject({ message: "화면 문구" });
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

  test("ends the session on a token error code even if the stored token has not expired", async () => {
    // 토큰 형식이 바뀐 배포 직후처럼 만료 시각이 남은 토큰도 서버에서는 무효일 수 있다.
    mockFetch(401, { code: "INVALID_TOKEN", status: 401, message: "유효하지 않은 토큰입니다." });

    const dispatched = await countUnauthorizedEvents(
      createToken(Date.now() / 1000 + 600),
    );

    expect(dispatched).toBe(1);
  });

  test("keeps the session on a 401 that is not about the token", async () => {
    mockFetch(401, {
      code: "PASSWORD_MISMATCH",
      status: 401,
      message: "아이디 또는 비밀번호가 일치하지 않습니다.",
    });

    const dispatched = await countUnauthorizedEvents(
      createToken(Date.now() / 1000 + 600),
    );

    expect(dispatched).toBe(0);
  });

  // 예전 배포본(code 없음)은 권한 부족에도 401 을 줬다. 토큰이 살아 있으면 로그아웃시키면 안 된다.
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
