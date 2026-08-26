import { describe, expect, test } from "bun:test";
import { ApiError } from "../api";
import {
  ADMIN_USERS_ENDPOINT,
  ADMIN_USERS_INVALID_RESPONSE_MESSAGE,
  deleteAdminUser,
  fetchAdminUsers,
  findAdminUserByAccountId,
  getAdminUserDeleteEndpoint,
} from "../adminUsers";

const hongUser = {
  userId: 1,
  accountId: "hong123",
  name: "홍길동",
  department: "민원과",
};

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

describe("fetchAdminUsers", () => {
  test("GETs the keyword query with auth header and returns parsed users", async () => {
    mockFetch(200, [hongUser], (url, init) => {
      expect(url).toBe(`${ADMIN_USERS_ENDPOINT}?keyword=hong123&page=1&size=100`);
      expect(init?.method).toBe("GET");
      expect(init?.body).toBeUndefined();
      const headers = init?.headers as Record<string, string>;
      expect(headers["Content-Type"]).toBeUndefined();
      expect(headers.Authorization).toBe("Bearer token-1");
    });

    expect(await fetchAdminUsers("hong123", { token: "token-1" })).toEqual([
      hongUser,
    ]);
  });

  test("encodes the keyword and applies page/size options", async () => {
    mockFetch(200, [], (url) => {
      expect(url).toBe(
        `${ADMIN_USERS_ENDPOINT}?keyword=${encodeURIComponent("홍길동")}&page=2&size=10`,
      );
    });

    expect(await fetchAdminUsers("홍길동", { page: 2, size: 10 })).toEqual([]);
  });

  test("skips malformed rows instead of failing the whole list", async () => {
    mockFetch(200, [
      hongUser,
      { ...hongUser, userId: "2" },
      { name: "홍길동" },
      null,
    ]);

    expect(await fetchAdminUsers("hong123")).toEqual([hongUser]);
  });

  test("rejects non-array 200 bodies", async () => {
    for (const body of [{}, "oops", 3]) {
      mockFetch(200, body);
      const error = await fetchAdminUsers("hong123").catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(200);
      expect((error as ApiError).message).toBe(
        ADMIN_USERS_INVALID_RESPONSE_MESSAGE,
      );
    }
  });

  test("maps error statuses to Korean messages", async () => {
    const cases = [
      [400, "검색어를 확인해 주세요"],
      [401, "로그인이 만료되었습니다"],
      [403, "사용자 조회 권한이 없습니다"],
      [500, "일시적인 오류"],
    ] as const;

    for (const [status, message] of cases) {
      mockFetch(status, undefined);
      const error = await fetchAdminUsers("hong123").catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(status);
      expect((error as ApiError).message).toContain(message);
    }
  });
});

describe("findAdminUserByAccountId", () => {
  test("returns only the exact accountId match among similar rows", async () => {
    mockFetch(200, [
      { ...hongUser, userId: 1, accountId: "hong12" },
      { ...hongUser, userId: 2, accountId: "hong123" },
      { ...hongUser, userId: 3, accountId: "hong1234" },
    ]);

    expect(await findAdminUserByAccountId("hong123")).toEqual({
      ...hongUser,
      userId: 2,
      accountId: "hong123",
    });
  });

  test("returns null for empty, partial-only, or case-mismatched results", async () => {
    mockFetch(200, []);
    expect(await findAdminUserByAccountId("hong123")).toBeNull();

    mockFetch(200, [{ ...hongUser, accountId: "hong1234" }]);
    expect(await findAdminUserByAccountId("hong123")).toBeNull();

    mockFetch(200, [hongUser]);
    expect(await findAdminUserByAccountId("Hong123")).toBeNull();
  });
});

describe("deleteAdminUser", () => {
  test("DELETEs the user by numeric id with auth header and no body", async () => {
    mockFetch(200, undefined, (url, init) => {
      expect(url).toBe(getAdminUserDeleteEndpoint(5));
      expect(url).toBe("/api/admin/users/5");
      expect(init?.method).toBe("DELETE");
      expect(init?.body).toBeUndefined();
      const headers = init?.headers as Record<string, string>;
      expect(headers.Authorization).toBe("Bearer token-1");
    });

    await deleteAdminUser(5, { token: "token-1" });
  });

  test("resolves on 200 with an empty body", async () => {
    mockFetch(200, undefined);
    await deleteAdminUser(1);
  });

  test("resolves on 200 with a JSON body", async () => {
    mockFetch(200, "삭제완료");
    await deleteAdminUser(1);
  });

  test("resolves on 200 with a non-JSON text body", async () => {
    globalThis.fetch = (async () =>
      new Response("삭제완료", { status: 200 })) as typeof fetch;
    await deleteAdminUser(1);
  });

  test("resolves on 204", async () => {
    mockFetch(204, undefined);
    await deleteAdminUser(1);
  });

  test("maps error statuses to Korean messages", async () => {
    const cases = [
      [400, "삭제 요청이 올바르지 않습니다"],
      [401, "로그인이 만료되었습니다"],
      [403, "사용자 삭제 권한이 없습니다"],
      [404, "이미 삭제되었을 수 있습니다"],
      [500, "일시적인 오류"],
    ] as const;

    for (const [status, message] of cases) {
      mockFetch(status, undefined);
      const error = await deleteAdminUser(1).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(status);
      expect((error as ApiError).message).toContain(message);
    }
  });
});
