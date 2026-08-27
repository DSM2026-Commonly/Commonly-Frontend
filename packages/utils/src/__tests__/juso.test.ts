import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { ApiError } from "../api";
import {
  JUSO_INVALID_RESPONSE_MESSAGE,
  JUSO_MISSING_KEY_MESSAGE,
  JUSO_SEARCH_ENDPOINT,
  searchAddresses,
} from "../juso";

type JsonpHandler = (url: URL) => unknown;

const originalDocument = globalThis.document;
const originalWindow = globalThis.window;
const originalEnv = import.meta.env.VITE_JUSO_CONFM_KEY;

/**
 * JSONP 는 <script> 삽입 + 전역 콜백 호출로 동작하므로, 삽입된 스크립트의 src 를 읽어
 * 콜백을 직접 호출하는 최소한의 document/window 를 흉내낸다.
 */
function mockJsonp(handler: JsonpHandler) {
  const requestedUrls: URL[] = [];
  const fakeWindow = globalThis as unknown as Record<string, unknown> & {
    setTimeout: typeof setTimeout;
    clearTimeout: typeof clearTimeout;
  };

  const fakeDocument = {
    createElement: () => {
      const script: Record<string, unknown> = {
        remove: () => undefined,
      };
      return script;
    },
    head: {
      appendChild: (script: { src: string }) => {
        const url = new URL(script.src);
        requestedUrls.push(url);
        const callbackName = url.searchParams.get("callback") ?? "";
        const callback = fakeWindow[callbackName];
        const payload = handler(url);

        queueMicrotask(() => {
          if (payload === undefined) {
            (script as { onerror?: () => void }).onerror?.();
            return;
          }

          if (typeof callback === "function") {
            (callback as (value: unknown) => void)(payload);
          }
        });
      },
    },
  };

  (globalThis as { document: unknown }).document = fakeDocument;
  (globalThis as { window: unknown }).window = globalThis;

  return requestedUrls;
}

beforeEach(() => {
  (import.meta.env as Record<string, string | undefined>).VITE_JUSO_CONFM_KEY =
    "test-key";
});

afterEach(() => {
  (globalThis as { document: unknown }).document = originalDocument;
  (globalThis as { window: unknown }).window = originalWindow;
  (import.meta.env as Record<string, string | undefined>).VITE_JUSO_CONFM_KEY =
    originalEnv;
});

describe("searchAddresses", () => {
  test("throws when the confirm key is not configured", async () => {
    (import.meta.env as Record<string, string | undefined>).VITE_JUSO_CONFM_KEY =
      "";

    await expect(searchAddresses({ keyword: "대학로" })).rejects.toThrow(
      JUSO_MISSING_KEY_MESSAGE,
    );
  });

  test("returns an empty result without calling the API for a blank keyword", async () => {
    const urls = mockJsonp(() => ({}));

    expect(await searchAddresses({ keyword: "   " })).toEqual({
      totalCount: 0,
      page: 1,
      size: 10,
      addresses: [],
    });
    expect(urls).toHaveLength(0);
  });

  test("builds the JSONP request and normalizes the response", async () => {
    const urls = mockJsonp(() => ({
      results: {
        common: {
          errorCode: "0",
          errorMessage: "정상",
          totalCount: "23",
          currentPage: "2",
          countPerPage: "5",
        },
        juso: [
          {
            roadAddr: "대전광역시 유성구 대학로 211 (어은동)",
            jibunAddr: "대전광역시 유성구 어은동 4",
            zipNo: "34139",
            bdNm: "유성구청",
            bdMgtSn: "3020011000100040000000001",
          },
          { roadAddr: "   " },
          "invalid",
        ],
      },
    }));

    const result = await searchAddresses({
      keyword: " 대학로 211 ",
      page: 2,
      size: 5,
    });

    expect(urls).toHaveLength(1);
    expect(urls[0].origin + urls[0].pathname).toBe(JUSO_SEARCH_ENDPOINT);
    expect(urls[0].searchParams.get("confmKey")).toBe("test-key");
    expect(urls[0].searchParams.get("keyword")).toBe("대학로 211");
    expect(urls[0].searchParams.get("currentPage")).toBe("2");
    expect(urls[0].searchParams.get("countPerPage")).toBe("5");
    expect(urls[0].searchParams.get("resultType")).toBe("json");
    expect(urls[0].searchParams.get("callback")).toMatch(/^__jusoCallback/);

    expect(result).toEqual({
      totalCount: 23,
      page: 2,
      size: 5,
      addresses: [
        {
          roadAddress: "대전광역시 유성구 대학로 211 (어은동)",
          jibunAddress: "대전광역시 유성구 어은동 4",
          zipCode: "34139",
          buildingName: "유성구청",
          buildingCode: "3020011000100040000000001",
        },
      ],
    });
  });

  test("surfaces the API error message for non-zero error codes", async () => {
    mockJsonp(() => ({
      results: {
        common: { errorCode: "E0005", errorMessage: "승인키가 유효하지 않습니다." },
      },
    }));

    const error = await searchAddresses({ keyword: "대학로" }).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).message).toBe("승인키가 유효하지 않습니다.");
    expect((error as ApiError).code).toBe("E0005");
  });

  test("rejects malformed payloads", async () => {
    mockJsonp(() => ({ unexpected: true }));

    await expect(searchAddresses({ keyword: "대학로" })).rejects.toThrow(
      JUSO_INVALID_RESPONSE_MESSAGE,
    );
  });

  test("rejects when the script fails to load", async () => {
    mockJsonp(() => undefined);

    await expect(searchAddresses({ keyword: "대학로" })).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});
