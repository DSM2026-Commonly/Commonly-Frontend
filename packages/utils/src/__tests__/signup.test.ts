import { describe, expect, test } from "bun:test";
import { ApiError } from "../api";
import { SIGNUP_ENDPOINT, signup } from "../signup";

function mockFetch(status: number, body?: unknown) {
  globalThis.fetch = (async (url: unknown, init?: RequestInit) => {
    expect(String(url)).toBe(SIGNUP_ENDPOINT);
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

describe("signup", () => {
  test("200 returns trimmed tokens", async () => {
    mockFetch(200, { accessToken: " a ", refreshToken: "r\n" });
    expect(await signup(credentials)).toEqual({
      accessToken: "a",
      refreshToken: "r",
    });
  });

  test("200 with empty or missing tokens throws invalid response", async () => {
    for (const body of [
      { accessToken: "", refreshToken: "r" },
      { accessToken: "a" },
      {},
    ]) {
      mockFetch(200, body);
      const error = await signup(credentials).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toBe(
        "회원가입 응답이 올바르지 않습니다.",
      );
    }
  });

  test("400 / 401 / 500 map to messages", async () => {
    for (const [status, message] of [
      [400, "입력한 정보가 조건에 맞지 않습니다. 아이디와 비밀번호를 확인해주세요."],
      [401, "아이디 또는 비밀번호가 맞지 않습니다."],
      [500, "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."],
    ] as const) {
      mockFetch(status);
      const error = await signup(credentials).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(status);
      expect((error as ApiError).message).toBe(message);
    }
  });
});
