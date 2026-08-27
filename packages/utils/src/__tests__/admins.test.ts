import { describe, expect, test } from "bun:test";
import {
  ADMIN_USERS_ENDPOINT,
  buildAdminUsersPath,
  fetchAdminUsers,
} from "../admins";
import { ApiError } from "../api";

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

describe("buildAdminUsersPath", () => {
  test("uses defaults and omits empty keyword", () => {
    expect(buildAdminUsersPath()).toBe(`${ADMIN_USERS_ENDPOINT}?page=1&size=10`);
    expect(buildAdminUsersPath({ keyword: "   " })).toBe(
      `${ADMIN_USERS_ENDPOINT}?page=1&size=10`,
    );
  });

  test("encodes keyword and clamps page/size", () => {
    expect(buildAdminUsersPath({ page: 0, size: 3.7, keyword: " 홍길동 " })).toBe(
      `${ADMIN_USERS_ENDPOINT}?page=1&size=3&keyword=${encodeURIComponent("홍길동")}`,
    );
  });

  test("falls back to defaults for non-finite page/size", () => {
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(buildAdminUsersPath({ page: value, size: value })).toBe(
        `${ADMIN_USERS_ENDPOINT}?page=1&size=10`,
      );
    }
  });
});

describe("fetchAdminUsers", () => {
  test("sends bearer token and normalizes list", async () => {
    let requestedUrl = "";
    let authorization: string | undefined;
    mockFetch(
      200,
      {
        content: [
          { userId: 1, accountId: "a", name: "홍길동", department: "" },
          { userId: 2, accountId: "b", name: "홍길동2" },
        ],
        totalCount: 50,
        totalPages: 5,
      },
      (url, init) => {
        requestedUrl = url;
        authorization = (init?.headers as Record<string, string> | undefined)
          ?.Authorization;
      },
    );

    const users = await fetchAdminUsers(
      { page: 2, size: 5, keyword: "홍" },
      { token: "token" },
    );

    expect(requestedUrl).toBe(
      `${ADMIN_USERS_ENDPOINT}?page=2&size=5&keyword=${encodeURIComponent("홍")}`,
    );
    expect(authorization).toBe("Bearer token");
    expect(users).toEqual({
      content: [
        { userId: 1, accountId: "a", name: "홍길동", department: "" },
        { userId: 2, accountId: "b", name: "홍길동2", department: "" },
      ],
      totalCount: 50,
      totalPages: 5,
    });
  });

  test("empty content returns empty page", async () => {
    mockFetch(200, { content: [], totalCount: 0, totalPages: 0 });
    expect(await fetchAdminUsers()).toEqual({
      content: [],
      totalCount: 0,
      totalPages: 1,
    });
  });

  test("missing totals fall back", async () => {
    mockFetch(200, { content: [{ userId: 1 }] });
    expect(await fetchAdminUsers()).toEqual({
      content: [{ userId: 1, accountId: "", name: "", department: "" }],
      totalCount: 1,
      totalPages: 1,
    });
  });

  test("malformed rows are skipped", async () => {
    mockFetch(200, {
      content: [{ accountId: "a" }, { userId: 3, accountId: "ok", name: "n" }],
      totalCount: 2,
      totalPages: 1,
    });
    const page = await fetchAdminUsers();
    expect(page.content.map((user) => user.userId)).toEqual([3]);
  });

  test("non-array body throws invalid response", async () => {
    for (const body of [[], {}, "x"]) {
      mockFetch(200, body);
      const error = await fetchAdminUsers().catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toBe(
        "사용자 목록 응답이 올바르지 않습니다.",
      );
    }
  });

  test("401 / 500 map to messages", async () => {
    for (const [status, message] of [
      [401, "사용자 목록을 조회할 권한이 없습니다. 다시 로그인해 주세요."],
      [500, "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."],
    ] as const) {
      mockFetch(status);
      const error = await fetchAdminUsers().catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(status);
      expect((error as ApiError).message).toBe(message);
    }
  });
});
