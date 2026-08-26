import { describe, expect, test } from "bun:test";
import { ApiError } from "../api";
import {
  HUMAN_SEARCH_ENDPOINT,
  HUMAN_SEARCH_INVALID_RESPONSE_MESSAGE,
  searchHumans,
} from "../humans";

const hongHuman = {
  humanId: 1,
  name: "홍길동",
  gender: "M",
  birthDate: "1990-01-01",
  address: "세종특별자치시 한누리대로 2130",
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

describe("searchHumans", () => {
  test("POSTs the search filters with auth header and returns content rows", async () => {
    const query = {
      name: "홍길동",
      birthDateFrom: "1990-01-01",
      birthDateTo: "1990-01-01",
    };

    mockFetch(
      200,
      { content: [hongHuman], page: 0, size: 20, totalElements: 1, totalPages: 1 },
      (url, init) => {
        expect(url).toBe(HUMAN_SEARCH_ENDPOINT);
        expect(init?.method).toBe("POST");
        const headers = init?.headers as Record<string, string>;
        expect(headers["Content-Type"]).toBe("application/json");
        expect(headers.Authorization).toBe("Bearer token-1");
        expect(JSON.parse(String(init?.body))).toEqual(query);
      },
    );

    expect(await searchHumans(query, { token: "token-1" })).toEqual([hongHuman]);
  });

  test("returns an empty list when content is empty", async () => {
    mockFetch(200, { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 });
    expect(await searchHumans({ name: "없는사람" })).toEqual([]);
  });

  test("skips malformed rows instead of failing the whole list", async () => {
    mockFetch(200, {
      content: [hongHuman, { ...hongHuman, humanId: "2" }, null],
    });

    expect(await searchHumans({ name: "홍" })).toEqual([hongHuman]);
  });

  test("rejects bodies without a content array", async () => {
    for (const body of [{}, { content: "oops" }, [], "oops"]) {
      mockFetch(200, body);
      const error = await searchHumans({ name: "홍" }).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(200);
      expect((error as ApiError).message).toBe(
        HUMAN_SEARCH_INVALID_RESPONSE_MESSAGE,
      );
    }
  });

  test("maps error statuses to Korean messages", async () => {
    const cases = [
      [400, "생년월일 범위를 확인"],
      [401, "로그인이 만료되었습니다"],
      [500, "일시적인 오류"],
    ] as const;

    for (const [status, message] of cases) {
      mockFetch(status, undefined);
      const error = await searchHumans({ name: "홍" }).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(status);
      expect((error as ApiError).message).toContain(message);
    }
  });
});
