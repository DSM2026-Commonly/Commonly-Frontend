import { describe, expect, test } from "bun:test";
import { ApiError } from "../api";
import {
  HUMAN_CREATE_INVALID_RESPONSE_MESSAGE,
  HUMAN_DELETE_NOT_FOUND_MESSAGE,
  HUMAN_DELETE_UNAUTHORIZED_MESSAGE,
  HUMAN_ENDPOINT,
  HUMAN_SEARCH_ENDPOINT,
  HUMAN_SEARCH_INVALID_RESPONSE_MESSAGE,
  createHuman,
  deleteHuman,
  getHumanDeleteEndpoint,
  getHumanUpdateEndpoint,
  searchHumans,
  searchHumansPaged,
  updateHuman,
} from "../humans";

const hongHuman = {
  humanId: 1,
  name: "홍길동",
  gender: "M",
  birthDate: "1990-01-01",
  address: "세종특별자치시 한누리대로 2130",
  department: "민원과",
};

const updateRequest = {
  name: "홍길동",
  gender: "M" as const,
  birthDate: "1990-01-01",
  address: "세종특별자치시 한누리대로 2130",
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

describe("searchHumans", () => {
  test("POSTs the search filters with auth header and returns content rows", async () => {
    const query = {
      name: "홍길동",
      birthDateFrom: "1990-01-01",
      birthDateTo: "1990-01-01",
    };

    mockFetch(
      200,
      { content: [hongHuman], page: 1, size: 20, totalElements: 1, totalPages: 1 },
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
    mockFetch(200, { content: [], page: 1, size: 20, totalElements: 0, totalPages: 0 });
    expect(await searchHumans({ name: "없는사람" })).toEqual([]);
  });

  test("skips malformed rows instead of failing the whole list", async () => {
    mockFetch(200, {
      content: [
        hongHuman,
        { ...hongHuman, humanId: "2" },
        { ...hongHuman, name: null },
        { ...hongHuman, address: 5 },
        { ...hongHuman, department: 7 },
        null,
      ],
    });

    expect(await searchHumans({ name: "홍" })).toEqual([hongHuman]);
  });

  test("normalizes null or omitted optional fields to empty strings", async () => {
    mockFetch(200, {
      content: [
        { humanId: 2, name: "홍길동", birthDate: "1990-01-01", gender: null },
      ],
    });

    expect(await searchHumans({ name: "홍" })).toEqual([
      {
        humanId: 2,
        name: "홍길동",
        gender: "",
        birthDate: "1990-01-01",
        address: "",
        department: "",
      },
    ]);
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

describe("searchHumansPaged", () => {
  test("sends page(1부터)/size in the body and returns the page meta", async () => {
    const query = {
      name: "홍길동",
      birthDateFrom: "1990-01-01",
      birthDateTo: "1990-01-01",
    };

    mockFetch(
      200,
      {
        content: [hongHuman],
        page: 2,
        size: 20,
        totalElements: 45,
        totalPages: 3,
      },
      (url, init) => {
        expect(url).toBe(HUMAN_SEARCH_ENDPOINT);
        expect(init?.method).toBe("POST");
        expect(JSON.parse(String(init?.body))).toEqual({
          ...query,
          page: 2,
          size: 20,
        });
      },
    );

    expect(await searchHumansPaged(query, { page: 2 })).toEqual({
      items: [hongHuman],
      page: 2,
      size: 20,
      totalElements: 45,
      totalPages: 3,
    });
  });

  test("defaults to page 1 / size 20 and clamps a page below 1 (backend counts from 1)", async () => {
    mockFetch(200, { content: [], page: 1, size: 20, totalElements: 0, totalPages: 0 }, (_url, init) => {
      expect(JSON.parse(String(init?.body))).toEqual({ page: 1, size: 20 });
    });
    await searchHumansPaged();

    mockFetch(200, { content: [] }, (_url, init) => {
      expect(JSON.parse(String(init?.body)).page).toBe(1);
    });
    await searchHumansPaged({}, { page: -5 });
  });

  test("fills missing meta: totalPages from totalElements/size, falling back to the request", async () => {
    mockFetch(200, { content: [hongHuman], totalElements: 41 });
    expect(await searchHumansPaged({}, { page: 1, size: 20 })).toEqual({
      items: [hongHuman],
      page: 1,
      size: 20,
      totalElements: 41,
      totalPages: 3,
    });
  });

  test("defaults totalElements to the row count and totalPages to at least 1", async () => {
    mockFetch(200, { content: [hongHuman] });
    expect(await searchHumansPaged()).toEqual({
      items: [hongHuman],
      page: 1,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    });
  });

  test("preserves totalPages 0 for an empty result (totalElements 0)", async () => {
    mockFetch(200, {
      content: [],
      page: 1,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    });
    expect(await searchHumansPaged()).toEqual({
      items: [],
      page: 1,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    });
  });

  test("reads the last page meta as the server reports it", async () => {
    // 45건 / size 20 → 마지막 페이지는 3(1부터 센다).
    mockFetch(200, {
      content: [hongHuman],
      page: 3,
      size: 20,
      totalElements: 45,
      totalPages: 3,
    });
    const result = await searchHumansPaged({}, { page: 3 });
    expect(result.page).toBe(3);
    expect(result.totalPages).toBe(3);
  });

  test("clamps size to the backend max of 100", async () => {
    mockFetch(200, { content: [] }, (_url, init) => {
      expect(JSON.parse(String(init?.body)).size).toBe(100);
    });
    await searchHumansPaged({}, { page: 1, size: 500 });
  });

  test("skips malformed rows but keeps the meta", async () => {
    mockFetch(200, {
      content: [hongHuman, { ...hongHuman, humanId: "2" }, null],
      page: 1,
      size: 20,
      totalElements: 3,
      totalPages: 1,
    });
    const result = await searchHumansPaged();
    expect(result.items).toEqual([hongHuman]);
    expect(result.totalElements).toBe(3);
  });

  test("rejects a bare array or a body without a content array", async () => {
    for (const body of [[hongHuman], {}, { content: "oops" }, "oops"]) {
      mockFetch(200, body);
      const error = await searchHumansPaged().catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toBe(
        HUMAN_SEARCH_INVALID_RESPONSE_MESSAGE,
      );
    }
  });
});

describe("createHuman", () => {
  test("POSTs the human with all keys and auth header, returns humanId", async () => {
    mockFetch(201, { humanId: 7 }, (url, init) => {
      expect(url).toBe(HUMAN_ENDPOINT);
      expect(url).toBe("/api/human");
      expect(init?.method).toBe("POST");
      const headers = init?.headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("application/json");
      expect(headers.Authorization).toBe("Bearer token-1");
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(body).toEqual(updateRequest);
      expect(Object.keys(body).sort()).toEqual([
        "address",
        "birthDate",
        "department",
        "gender",
        "name",
      ]);
    });

    await expect(
      createHuman(updateRequest, { token: "token-1" }),
    ).resolves.toEqual({ humanId: 7 });
  });

  test("sends null address when the form has none", async () => {
    mockFetch(201, { humanId: 8 }, (_url, init) => {
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(body.address).toBeNull();
    });

    await createHuman({ ...updateRequest, address: null });
  });

  test("rejects a response without a valid humanId", async () => {
    for (const body of [undefined, {}, { humanId: "7" }, { humanId: 0 }]) {
      mockFetch(201, body);
      const error = await createHuman(updateRequest).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toBe(
        HUMAN_CREATE_INVALID_RESPONSE_MESSAGE,
      );
    }
  });

  test("maps error statuses to Korean messages", async () => {
    const cases = [
      [400, "입력값이 올바르지 않습니다"],
      [401, "로그인이 만료되었습니다"],
      [409, "기존 대상자를 선택해 주세요"],
      [500, "일시적인 오류"],
    ] as const;

    for (const [status, message] of cases) {
      mockFetch(status, undefined);
      const error = await createHuman(updateRequest).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(status);
      expect((error as ApiError).message).toContain(message);
    }
  });
});

describe("updateHuman", () => {
  test("PUTs the human by id with all keys and auth header", async () => {
    mockFetch(204, undefined, (url, init) => {
      expect(url).toBe(getHumanUpdateEndpoint(1));
      expect(url).toBe("/api/human/1");
      expect(init?.method).toBe("PUT");
      const headers = init?.headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("application/json");
      expect(headers.Authorization).toBe("Bearer token-1");
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(body).toEqual(updateRequest);
      expect(Object.keys(body).sort()).toEqual([
        "address",
        "birthDate",
        "department",
        "gender",
        "name",
      ]);
    });

    await updateHuman(1, updateRequest, { token: "token-1" });
  });

  test("resolves on 204 with an empty body", async () => {
    mockFetch(204, undefined);
    await updateHuman(1, updateRequest);
  });

  test("maps error statuses to Korean messages", async () => {
    const cases = [
      [400, "입력값이 올바르지 않습니다"],
      [401, "로그인이 만료되었습니다"],
      [404, "찾을 수 없습니다"],
      [409, "이미 존재합니다"],
      [500, "일시적인 오류"],
    ] as const;

    for (const [status, message] of cases) {
      mockFetch(status, undefined);
      const error = await updateHuman(1, updateRequest).catch(
        (e: unknown) => e,
      );
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(status);
      expect((error as ApiError).message).toContain(message);
    }
  });
});

describe("deleteHuman", () => {
  test("DELETEs the human by id with auth header", async () => {
    mockFetch(204, undefined, (url, init) => {
      expect(url).toBe(getHumanDeleteEndpoint(1));
      expect(url).toBe("/api/human/1");
      expect(init?.method).toBe("DELETE");
      expect(init?.body).toBeUndefined();
      expect(new Headers(init?.headers).get("Authorization")).toBe(
        "Bearer token-1",
      );
    });

    await deleteHuman(1, { token: "token-1" });
  });

  test("maps error statuses to Korean messages", async () => {
    const cases = [
      [401, HUMAN_DELETE_UNAUTHORIZED_MESSAGE],
      [404, HUMAN_DELETE_NOT_FOUND_MESSAGE],
    ] as const;

    for (const [status, message] of cases) {
      mockFetch(status, undefined);
      await expect(deleteHuman(1)).rejects.toThrow(message);
    }
  });
});
