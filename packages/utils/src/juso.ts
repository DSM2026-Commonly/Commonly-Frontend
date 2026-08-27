import { ApiError, NETWORK_ERROR_MESSAGE } from "./api";

/**
 * 행정안전부 도로명주소 검색 API (business.juso.go.kr).
 * 브라우저에서 직접 호출하므로 CORS 제약이 없는 JSONP 엔드포인트를 사용한다.
 */
export const JUSO_SEARCH_ENDPOINT =
  "https://business.juso.go.kr/addrlink/addrLinkApiJsonp.do";
export const JUSO_DEFAULT_PAGE_SIZE = 10;
export const JUSO_MAX_PAGE_SIZE = 100;
export const JUSO_MISSING_KEY_MESSAGE =
  "주소 검색 API 키(VITE_JUSO_CONFM_KEY)가 설정되지 않았습니다.";
export const JUSO_INVALID_RESPONSE_MESSAGE =
  "주소 검색 응답이 올바르지 않습니다.";
export const JUSO_TIMEOUT_MESSAGE =
  "주소 검색 서버가 응답하지 않습니다. 잠시 후 다시 시도해 주세요.";

const JUSO_REQUEST_TIMEOUT_MS = 10_000;

export function getJusoConfirmKey(): string {
  return import.meta.env.VITE_JUSO_CONFM_KEY?.trim() ?? "";
}

export interface JusoAddress {
  /** 전체 도로명주소 */
  roadAddress: string;
  /** 지번주소 */
  jibunAddress: string;
  zipCode: string;
  buildingName: string;
  /** 도로명주소 검색 결과의 건물관리번호. 같은 주소를 구분하는 고유 키로 쓴다. */
  buildingCode: string;
}

export interface JusoSearchQuery {
  keyword: string;
  page?: number;
  size?: number;
}

export interface JusoSearchResult {
  totalCount: number;
  page: number;
  size: number;
  addresses: JusoAddress[];
}

export interface JusoSearchOptions {
  signal?: AbortSignal;
}

interface JusoRawResponse {
  results?: {
    common?: {
      errorCode?: string;
      errorMessage?: string;
      totalCount?: string;
      currentPage?: string;
      countPerPage?: string;
    };
    juso?: unknown;
  };
}

function normalizeAddress(value: unknown): JusoAddress | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const { roadAddr, jibunAddr, zipNo, bdNm, bdMgtSn } = value as Record<
    string,
    unknown
  >;

  if (typeof roadAddr !== "string" || !roadAddr.trim()) {
    return null;
  }

  return {
    roadAddress: roadAddr.trim(),
    jibunAddress: typeof jibunAddr === "string" ? jibunAddr.trim() : "",
    zipCode: typeof zipNo === "string" ? zipNo.trim() : "",
    buildingName: typeof bdNm === "string" ? bdNm.trim() : "",
    buildingCode: typeof bdMgtSn === "string" ? bdMgtSn.trim() : "",
  };
}

function parseCount(value: unknown, fallback: number): number {
  const parsed = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

let callbackSequence = 0;

/**
 * JSONP 로 스크립트를 삽입하고 콜백으로 전달된 JSON 을 돌려준다.
 * 응답 스키마 검증은 호출부에서 수행한다.
 */
function requestJsonp(url: URL, signal?: AbortSignal): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new ApiError(0, NETWORK_ERROR_MESSAGE));
      return;
    }

    const callbackName = `__jusoCallback${Date.now()}_${callbackSequence++}`;
    const script = document.createElement("script");
    const globalScope = window as unknown as Record<string, unknown>;

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", handleAbort);
      delete globalScope[callbackName];
      script.remove();
    };

    const handleAbort = () => {
      cleanup();
      reject(new DOMException("주소 검색이 취소되었습니다.", "AbortError"));
    };

    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new ApiError(0, JUSO_TIMEOUT_MESSAGE));
    }, JUSO_REQUEST_TIMEOUT_MS);

    if (signal?.aborted) {
      handleAbort();
      return;
    }

    signal?.addEventListener("abort", handleAbort);

    globalScope[callbackName] = (payload: unknown) => {
      cleanup();
      resolve(payload);
    };

    script.onerror = () => {
      cleanup();
      reject(new ApiError(0, NETWORK_ERROR_MESSAGE));
    };

    url.searchParams.set("callback", callbackName);
    script.src = url.toString();
    script.async = true;
    document.head.appendChild(script);
  });
}

export async function searchAddresses(
  { keyword, page = 1, size = JUSO_DEFAULT_PAGE_SIZE }: JusoSearchQuery,
  { signal }: JusoSearchOptions = {},
): Promise<JusoSearchResult> {
  const confirmKey = getJusoConfirmKey();

  if (!confirmKey) {
    throw new ApiError(0, JUSO_MISSING_KEY_MESSAGE);
  }

  const normalizedKeyword = keyword.trim();
  const normalizedPage = Math.max(1, Math.floor(page));
  const normalizedSize = Math.min(
    JUSO_MAX_PAGE_SIZE,
    Math.max(1, Math.floor(size)),
  );

  if (!normalizedKeyword) {
    return {
      totalCount: 0,
      page: normalizedPage,
      size: normalizedSize,
      addresses: [],
    };
  }

  const url = new URL(JUSO_SEARCH_ENDPOINT);
  url.searchParams.set("confmKey", confirmKey);
  url.searchParams.set("keyword", normalizedKeyword);
  url.searchParams.set("currentPage", String(normalizedPage));
  url.searchParams.set("countPerPage", String(normalizedSize));
  url.searchParams.set("resultType", "json");

  const payload = (await requestJsonp(url, signal)) as JusoRawResponse | null;
  const common = payload?.results?.common;

  if (!common || typeof common.errorCode !== "string") {
    throw new ApiError(200, JUSO_INVALID_RESPONSE_MESSAGE);
  }

  // errorCode "0" 이 정상. 그 외는 API 가 내려준 메시지를 그대로 노출한다.
  if (common.errorCode !== "0") {
    throw new ApiError(
      200,
      common.errorMessage?.trim() || JUSO_INVALID_RESPONSE_MESSAGE,
      { code: common.errorCode, message: common.errorMessage },
    );
  }

  const rawAddresses = payload?.results?.juso;
  const addresses: JusoAddress[] = [];

  if (Array.isArray(rawAddresses)) {
    for (const row of rawAddresses) {
      const address = normalizeAddress(row);

      if (address) {
        addresses.push(address);
      }
    }
  }

  return {
    totalCount: parseCount(common.totalCount, addresses.length),
    page: parseCount(common.currentPage, normalizedPage),
    size: parseCount(common.countPerPage, normalizedSize),
    addresses,
  };
}
