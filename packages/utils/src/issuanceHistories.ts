import {
  ApiError,
  normalizePageEnvelope,
  normalizePositiveInteger,
  request,
} from "./api";

export const ISSUANCE_HISTORIES_ENDPOINT = "/api/issuance-histories";

export const ISSUANCE_HISTORIES_DEFAULT_PAGE_SIZE = 10;

export const ISSUANCE_HISTORY_UNAUTHORIZED_MESSAGE =
  "발급 이력을 조회할 권한이 없습니다. 다시 로그인해 주세요.";
export const ISSUANCE_HISTORY_FORBIDDEN_MESSAGE =
  "본인 증명서 외의 발급 이력에는 접근할 수 없습니다.";
export const ISSUANCE_HISTORY_NOT_FOUND_MESSAGE = "조회된 이력이 없습니다.";
export const ISSUANCE_HISTORY_INVALID_RESPONSE_MESSAGE =
  "발급 이력 응답이 올바르지 않습니다.";

export const ISSUANCE_HISTORY_TYPES = ["ISSUANCE", "CREATION", "MODIFY"] as const;

export type IssuanceHistoryType = (typeof ISSUANCE_HISTORY_TYPES)[number];

export const ISSUANCE_HISTORY_TYPE_LABELS: Record<IssuanceHistoryType, string> =
  {
    ISSUANCE: "증명서 발급",
    CREATION: "경력사항 등록",
    MODIFY: "경력사항 수정",
  };

export interface IssuanceHistoryCertificate {
  certificateId: number;
  type: string;
  purpose: string;
}

export interface IssuanceHistory {
  issuanceHistoryId: number;
  certificate: IssuanceHistoryCertificate;
  /** 발급 문서번호 (예: 유성구-2026-000001). 서버가 주지 않으면 빈 문자열. */
  documentNo: string;
  targetName: string;
  /**
   * 서버가 알 수 없는 종류를 보내면 원문 그대로 유지한다.
   * 종류를 아예 주지 않으면(현재 백엔드) 발급 이력 API 이므로 ISSUANCE 로 본다.
   */
  type: IssuanceHistoryType | string;
  /** ISO LocalDateTime 문자열 (예: 2026-08-26T14:30:00). 서버 필드명 issuanceDate 또는 issuedAt. */
  issuanceDate: string;
  issuerName: string;
  issuerDepartment: string;
  reason: string;
}

export interface FetchIssuanceHistoriesParams {
  /** 1부터 시작하는 페이지 번호 */
  page?: number;
  size?: number;
  type?: IssuanceHistoryType | "";
  /** yyyy-MM-dd */
  startDate?: string;
  /** yyyy-MM-dd */
  endDate?: string;
  /** 증명서 대상자 성명 검색어 */
  keyword?: string;
}

export interface IssuanceHistoryPage {
  content: IssuanceHistory[];
  /** 서버가 전체 건수를 주지 않으면 현재 페이지 건수 */
  totalCount: number;
  /** 서버가 전체 페이지 수를 주지 않으면 null */
  totalPage: number | null;
  /**
   * 다음 페이지가 있을 가능성. 전체 페이지 수를 알면 그것으로,
   * 모르면 "요청한 size 만큼 꽉 찼는지"로 판단한다.
   */
  hasNextPage: boolean;
}

export interface FetchIssuanceHistoryOptions {
  token?: string | null;
  signal?: AbortSignal;
}

export function isIssuanceHistoryType(
  value: unknown,
): value is IssuanceHistoryType {
  return (
    typeof value === "string" &&
    (ISSUANCE_HISTORY_TYPES as readonly string[]).includes(value)
  );
}

export function getIssuanceHistoryTypeLabel(type: string): string {
  return isIssuanceHistoryType(type) ? ISSUANCE_HISTORY_TYPE_LABELS[type] : type;
}

export function buildIssuanceHistoriesPath({
  page = 1,
  size = ISSUANCE_HISTORIES_DEFAULT_PAGE_SIZE,
  type = "",
  startDate = "",
  endDate = "",
  keyword = "",
}: FetchIssuanceHistoriesParams = {}): string {
  const searchParams = new URLSearchParams({
    page: String(normalizePositiveInteger(page, 1)),
    size: String(normalizePositiveInteger(size, ISSUANCE_HISTORIES_DEFAULT_PAGE_SIZE)),
  });

  for (const [key, value] of [
    ["type", type],
    ["startDate", startDate],
    ["endDate", endDate],
    ["keyword", keyword],
  ] as const) {
    const trimmed = value.trim();

    if (trimmed) {
      searchParams.set(key, trimmed);
    }
  }

  return `${ISSUANCE_HISTORIES_ENDPOINT}?${searchParams.toString()}`;
}

function normalizeIssuanceHistory(value: unknown): IssuanceHistory | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const {
    issuanceHistoryId,
    certificate,
    documentNo,
    purpose,
    targetName,
    type,
    issuanceDate,
    issuedAt,
    issuerName,
    issuerDepartment,
    reason,
  } = value as Record<string, unknown>;

  if (
    typeof issuanceHistoryId !== "number" ||
    !Number.isFinite(issuanceHistoryId)
  ) {
    return null;
  }

  const certificateRecord =
    certificate && typeof certificate === "object"
      ? (certificate as Record<string, unknown>)
      : {};
  const certificateId = certificateRecord.certificateId;

  return {
    issuanceHistoryId,
    certificate: {
      certificateId:
        typeof certificateId === "number" && Number.isFinite(certificateId)
          ? certificateId
          : 0,
      type:
        typeof certificateRecord.type === "string" ? certificateRecord.type : "",
      // 백엔드는 purpose 를 최상위에 준다. 명세의 certificate.purpose 도 함께 받는다.
      purpose:
        typeof certificateRecord.purpose === "string"
          ? certificateRecord.purpose
          : typeof purpose === "string"
            ? purpose
            : "",
    },
    documentNo: typeof documentNo === "string" ? documentNo : "",
    targetName: typeof targetName === "string" ? targetName : "",
    type: typeof type === "string" ? type : "ISSUANCE",
    issuanceDate:
      typeof issuanceDate === "string"
        ? issuanceDate
        : typeof issuedAt === "string"
          ? issuedAt
          : "",
    issuerName: typeof issuerName === "string" ? issuerName : "",
    issuerDepartment:
      typeof issuerDepartment === "string" ? issuerDepartment : "",
    reason: typeof reason === "string" ? reason : "",
  };
}

const EMPTY_ISSUANCE_HISTORY_PAGE: IssuanceHistoryPage = {
  content: [],
  totalCount: 0,
  totalPage: 1,
  hasNextPage: false,
};

/**
 * 발급 이력 목록 조회 (페이지 단위).
 * 서버가 "이력 없음"을 404로 응답하는 경우도 빈 페이지로 취급한다.
 */
export async function fetchIssuanceHistories(
  params: FetchIssuanceHistoriesParams = {},
  { token, signal }: FetchIssuanceHistoryOptions = {},
): Promise<IssuanceHistoryPage> {
  let response: unknown;

  try {
    response = await request<unknown>(buildIssuanceHistoriesPath(params), {
      token,
      signal,
      errorMessages: {
        401: ISSUANCE_HISTORY_UNAUTHORIZED_MESSAGE,
        403: ISSUANCE_HISTORY_FORBIDDEN_MESSAGE,
        404: ISSUANCE_HISTORY_NOT_FOUND_MESSAGE,
      },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { ...EMPTY_ISSUANCE_HISTORY_PAGE };
    }

    throw error;
  }

  // 백엔드(GET /api/issuance-histories)는 페이지 메타 없이 배열만 내려준다.
  // 명세의 {content, totalCount, totalPage} 형태도 함께 받는다.
  const { content, totalCount, totalPage } = normalizePageEnvelope(
    response,
    ISSUANCE_HISTORY_INVALID_RESPONSE_MESSAGE,
    "totalPage",
  );

  const histories: IssuanceHistory[] = [];

  for (const item of content) {
    const history = normalizeIssuanceHistory(item);

    if (!history) {
      throw new ApiError(200, ISSUANCE_HISTORY_INVALID_RESPONSE_MESSAGE);
    }

    histories.push(history);
  }

  const normalizedTotalCount =
    typeof totalCount === "number" && Number.isFinite(totalCount)
      ? Math.max(0, Math.floor(totalCount))
      : histories.length;
  const normalizedTotalPage =
    typeof totalPage === "number" && Number.isFinite(totalPage)
      ? Math.max(1, Math.floor(totalPage))
      : null;
  const requestedPage = normalizePositiveInteger(params.page ?? 1, 1);
  const requestedSize = normalizePositiveInteger(
    params.size ?? ISSUANCE_HISTORIES_DEFAULT_PAGE_SIZE,
    ISSUANCE_HISTORIES_DEFAULT_PAGE_SIZE,
  );

  return {
    content: histories,
    totalCount: normalizedTotalCount,
    totalPage: normalizedTotalPage,
    hasNextPage:
      normalizedTotalPage === null
        ? histories.length >= requestedSize
        : requestedPage < normalizedTotalPage,
  };
}
