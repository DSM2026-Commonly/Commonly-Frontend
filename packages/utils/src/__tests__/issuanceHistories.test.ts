import { describe, expect, test } from "bun:test";
import { ApiError } from "../api";
import {
  ISSUANCE_HISTORIES_ENDPOINT,
  buildIssuanceHistoriesPath,
  fetchIssuanceHistories,
  getIssuanceHistoryTypeLabel,
} from "../issuanceHistories";

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

const history = {
  issuanceHistoryId: 1,
  certificate: { certificateId: 10, type: "CAREER", purpose: "은행 제출" },
  targetName: "홍길동",
  type: "ISSUANCE",
  issuanceDate: "2026-08-26T14:30:00",
  issuerName: "김담당",
  issuerDepartment: "민원과",
  reason: "은행 제출용",
};

describe("buildIssuanceHistoriesPath", () => {
  test("defaults and omits empty filters", () => {
    expect(buildIssuanceHistoriesPath()).toBe(
      `${ISSUANCE_HISTORIES_ENDPOINT}?page=1&size=10`,
    );
    expect(buildIssuanceHistoriesPath({ keyword: " ", type: "" })).toBe(
      `${ISSUANCE_HISTORIES_ENDPOINT}?page=1&size=10`,
    );
  });

  test("includes filters", () => {
    expect(
      buildIssuanceHistoriesPath({
        page: 2,
        size: 20,
        type: "MODIFY",
        startDate: "2026-08-01",
        endDate: "2026-08-26",
        keyword: "홍",
      }),
    ).toBe(
      `${ISSUANCE_HISTORIES_ENDPOINT}?page=2&size=20&type=MODIFY&startDate=2026-08-01&endDate=2026-08-26&keyword=${encodeURIComponent("홍")}`,
    );
  });
});

describe("getIssuanceHistoryTypeLabel", () => {
  test("maps known types and passes through unknown", () => {
    expect(getIssuanceHistoryTypeLabel("ISSUANCE")).toBe("증명서 발급");
    expect(getIssuanceHistoryTypeLabel("CREATION")).toBe("경력사항 등록");
    expect(getIssuanceHistoryTypeLabel("MODIFY")).toBe("경력사항 수정");
    expect(getIssuanceHistoryTypeLabel("OTHER")).toBe("OTHER");
  });
});

describe("fetchIssuanceHistories", () => {
  test("GET with token, normalizes list", async () => {
    let requestedUrl = "";
    let method: string | undefined;
    let authorization: string | undefined;
    mockFetch(
      200,
      { content: [history, { issuanceHistoryId: 2 }], totalCount: 25, totalPage: 3 },
      (url, init) => {
      requestedUrl = url;
      method = init?.method;
      authorization = (init?.headers as Record<string, string> | undefined)
        ?.Authorization;
      },
    );

    expect(
      await fetchIssuanceHistories({ page: 3 }, { token: "t" }),
    ).toEqual({
      content: [
        history,
        {
          issuanceHistoryId: 2,
          certificate: { certificateId: 0, type: "", purpose: "" },
          targetName: "",
          type: "",
          issuanceDate: "",
          issuerName: "",
          issuerDepartment: "",
          reason: "",
        },
      ],
      totalCount: 25,
      totalPage: 3,
    });
    expect(requestedUrl).toBe(`${ISSUANCE_HISTORIES_ENDPOINT}?page=3&size=10`);
    expect(method).toBe("GET");
    expect(authorization).toBe("Bearer t");
  });

  test("empty content returns empty page", async () => {
    mockFetch(200, { content: [], totalCount: 0, totalPage: 0 });
    expect(await fetchIssuanceHistories()).toEqual({
      content: [],
      totalCount: 0,
      totalPage: 1,
    });
  });

  test("missing totals fall back", async () => {
    mockFetch(200, { content: [history] });
    expect(await fetchIssuanceHistories()).toEqual({
      content: [history],
      totalCount: 1,
      totalPage: 1,
    });
  });

  test("malformed response throws invalid response", async () => {
    for (const body of [[], {}, { content: [{ certificateId: 1 }] }]) {
      mockFetch(200, body);
      const error = await fetchIssuanceHistories().catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toBe(
        "발급 이력 응답이 올바르지 않습니다.",
      );
    }
  });

  test("404 is treated as an empty page", async () => {
    mockFetch(404);
    expect(await fetchIssuanceHistories()).toEqual({
      content: [],
      totalCount: 0,
      totalPage: 1,
    });
  });

  test("401 / 403 / 500 map to messages", async () => {
    for (const [status, message] of [
      [401, "발급 이력을 조회할 권한이 없습니다. 다시 로그인해 주세요."],
      [403, "본인 증명서 외의 발급 이력에는 접근할 수 없습니다."],
      [500, "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."],
    ] as const) {
      mockFetch(status);
      const error = await fetchIssuanceHistories().catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(status);
      expect((error as ApiError).message).toBe(message);
    }
  });
});
