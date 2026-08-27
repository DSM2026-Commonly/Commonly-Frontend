import { describe, expect, test } from "bun:test";
import { ApiError } from "../api";
import {
  ADMIN_USER_CREATE_ENDPOINT,
  createAdminUser,
  deleteAdminUser,
  getAdminUserDeleteEndpoint,
} from "../adminUsers";

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

describe("createAdminUser", () => {
  const newUser = {
    accountId: "hong1234",
    name: "홍길동",
    department: "민원과",
  };

  test("POSTs the user with auth header and resolves on 200", async () => {
    mockFetch(200, undefined, (url, init) => {
      expect(url).toBe(ADMIN_USER_CREATE_ENDPOINT);
      expect(init?.method).toBe("POST");
      expect(JSON.parse(String(init?.body))).toEqual(newUser);
      const headers = init?.headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("application/json");
      expect(headers.Authorization).toBe("Bearer token-1");
    });

    await createAdminUser(newUser, { token: "token-1" });
  });

  test("maps error statuses to Korean messages", async () => {
    const cases = [
      [400, "입력값을 확인해 주세요"],
      [401, "로그인이 만료되었습니다"],
      [409, "이미 사용 중인 아이디입니다"],
      [500, "일시적인 오류"],
    ] as const;

    for (const [status, message] of cases) {
      mockFetch(status, undefined);
      const error = await createAdminUser(newUser).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(status);
      expect((error as ApiError).message).toContain(message);
    }
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
