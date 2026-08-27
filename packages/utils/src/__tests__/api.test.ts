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
    let dispatched = 0;
    const listener = () => void dispatched++;
    const fakeWindow = new EventTarget();
    (globalThis as { window?: unknown }).window = fakeWindow;
    fakeWindow.addEventListener(UNAUTHORIZED_EVENT, listener);

    try {
      await expect(request("/x")).rejects.toMatchObject({ status: 401 });
    } finally {
      delete (globalThis as { window?: unknown }).window;
    }

    expect(dispatched).toBe(1);
  });
});
