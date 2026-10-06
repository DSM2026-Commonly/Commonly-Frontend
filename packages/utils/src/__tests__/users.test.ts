import { describe, expect, test } from "bun:test";
import { ApiError } from "../api";
import {
  fetchMe,
  ME_ENDPOINT,
  ME_INVALID_RESPONSE_MESSAGE,
  ME_UNAUTHORIZED_MESSAGE,
} from "../users";

function mockFetch(
  status: number,
  body: unknown,
  assertInit?: (url: string, init?: RequestInit) => void,
) {
  globalThis.fetch = (async (url: unknown, init?: RequestInit) => {
    assertInit?.(String(url), init);
    return new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
}

const petitioner = {
  userId: 3,
  accountId: "civil01",
  name: "홍길동",
  authority: "PETITIONER",
  passwordChanged: true,
  department: null,
  phoneNumber: "010-0000-0000",
  birthDate: "1990-01-02",
};

describe("fetchMe", () => {
  test("GETs /api/users/me with the token and returns the real name", async () => {
    mockFetch(200, petitioner, (url, init) => {
      expect(url).toBe(ME_ENDPOINT);
      expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer t");
    });

    expect(await fetchMe({ token: "t" })).toEqual(petitioner);
  });

  test("turns blank optional fields into null (staff has no birth date)", async () => {
    mockFetch(200, {
      ...petitioner,
      authority: "USER",
      department: "민원과",
      phoneNumber: "",
      birthDate: null,
    });

    expect(await fetchMe()).toEqual({
      ...petitioner,
      authority: "USER",
      department: "민원과",
      phoneNumber: null,
      birthDate: null,
    });
  });

  test("rejects a body without the identity fields", async () => {
    mockFetch(200, { accountId: "civil01" });

    const error = await fetchMe().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).message).toBe(ME_INVALID_RESPONSE_MESSAGE);
  });

  test("maps 401 to the login-expired message", async () => {
    mockFetch(401, { status: 401, message: "인증이 필요합니다." });

    const error = await fetchMe({ token: "t" }).catch((caught: unknown) => caught);

    expect((error as ApiError).status).toBe(401);
    expect((error as ApiError).message).toBe(ME_UNAUTHORIZED_MESSAGE);
  });
});
