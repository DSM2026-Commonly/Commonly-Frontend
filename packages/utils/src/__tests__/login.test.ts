import { describe, expect, test } from "bun:test";
import { ApiError } from "../api";
import { isValidAccountId, isValidPassword, login } from "../login";

function mockFetch(status: number, body?: unknown) {
  globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      accountId: "user01",
      password: "password123",
    });
    return new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
}

const credentials = { accountId: "user01", password: "password123" };

describe("login", () => {
  test("200 returns tokens", async () => {
    mockFetch(200, { accessToken: "a", refreshToken: "r" });
    expect(await login(credentials)).toEqual({ accessToken: "a", refreshToken: "r" });
  });

  test("400 / 401 / 500 map to messages", async () => {
    for (const [status, message] of [
      [400, "입력한 정보가 조건에 맞지 않습니다. 아이디와 비밀번호를 확인해주세요."],
      [401, "아이디 또는 비밀번호가 맞지 않습니다."],
      [500, "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."],
    ] as const) {
      mockFetch(status);
      const error = await login(credentials).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(status);
      expect((error as ApiError).message).toBe(message);
    }
  });

  test("validation rules follow spec", () => {
    expect(isValidAccountId("abc")).toBe(false);
    expect(isValidAccountId("abcd")).toBe(true);
    expect(isValidAccountId("a".repeat(13))).toBe(false);
    expect(isValidAccountId("한글아이디")).toBe(false);
    expect(isValidPassword("1234567")).toBe(false);
    expect(isValidPassword("12345678")).toBe(true);
  });
});
