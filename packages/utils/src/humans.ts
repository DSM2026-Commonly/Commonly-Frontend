import { ApiError, normalizePositiveInteger, request } from "./api";

export const HUMAN_ENDPOINT = "/api/human";
export const HUMAN_SEARCH_ENDPOINT = "/api/human/search";

/** 대상자 검색 기본 페이지 크기. 백엔드 기본값과 맞춘다. */
export const HUMAN_SEARCH_DEFAULT_PAGE_SIZE = 20;
/** 백엔드 size 제약(@Max(100)). 초과로 보내면 400 이라 요청 전에 상한을 지킨다. */
export const HUMAN_SEARCH_MAX_PAGE_SIZE = 100;

export function getHumanUpdateEndpoint(humanId: number): string {
  return `/api/human/${humanId}`;
}

// 삭제는 수정과 같은 경로를 DELETE 로 부른다.
export function getHumanDeleteEndpoint(humanId: number): string {
  return `/api/human/${humanId}`;
}

export const HUMAN_SEARCH_INVALID_RESPONSE_MESSAGE =
  "대상자 조회 응답이 올바르지 않습니다.";
export const HUMAN_SEARCH_BAD_REQUEST_MESSAGE =
  "검색 조건이 올바르지 않습니다. 생년월일 범위를 확인해 주세요.";
export const HUMAN_SEARCH_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const HUMAN_CREATE_INVALID_RESPONSE_MESSAGE =
  "대상자 등록 응답이 올바르지 않습니다.";
export const HUMAN_CREATE_BAD_REQUEST_MESSAGE =
  "입력값이 올바르지 않습니다. 입력 내용을 확인해 주세요.";
export const HUMAN_CREATE_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const HUMAN_CREATE_CONFLICT_MESSAGE =
  "동일한 성명과 생년월일의 대상자가 이미 등록되어 있습니다. 중복 확인에서 기존 대상자를 선택해 주세요.";
export const HUMAN_UPDATE_BAD_REQUEST_MESSAGE =
  "입력값이 올바르지 않습니다. 입력 내용을 확인해 주세요.";
export const HUMAN_UPDATE_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const HUMAN_UPDATE_NOT_FOUND_MESSAGE =
  "대상자의 인적사항을 찾을 수 없습니다. 다시 조회해 주세요.";
export const HUMAN_UPDATE_CONFLICT_MESSAGE =
  "동일한 성명과 생년월일의 인적사항이 이미 존재합니다.";
export const HUMAN_DELETE_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const HUMAN_DELETE_FORBIDDEN_MESSAGE =
  "대상자를 삭제할 권한이 없습니다.";
export const HUMAN_DELETE_NOT_FOUND_MESSAGE =
  "이미 삭제되었거나 찾을 수 없는 대상자입니다.";
export const HUMAN_DELETE_CONFLICT_MESSAGE =
  "연결된 경력 사항이나 발급 기록이 있어 삭제할 수 없습니다.";
/** HUMAN_HAS_ISSUED_CERTIFICATE(409). 발급 기록은 공문서 대장이라 지울 수 없다. */
export const HUMAN_DELETE_HAS_ISSUED_MESSAGE =
  "이미 발급된 경력증명서가 있어 삭제할 수 없습니다. 발급 이력은 보존해야 하므로 인적사항 수정을 이용해 주세요.";
/**
 * HUMAN_HAS_CERTIFICATE(409). 백엔드 문구는 "재직 이력을 먼저 삭제"하라고 하지만
 * 재직 이력을 지우는 기능이 없어 그 안내는 하지 않는다.
 */
export const HUMAN_DELETE_HAS_CAREER_MESSAGE =
  "등록된 경력 사항이 있어 삭제할 수 없습니다.";

export interface HumanSummary {
  humanId: number;
  name: string;
  gender: string;
  birthDate: string;
  address: string;
  department: string;
}

export interface SearchHumansQuery {
  name?: string;
  gender?: string;
  birthDateFrom?: string;
  birthDateTo?: string;
  address?: string;
}

/** 대상자 검색 페이지 요청. page 는 1부터 시작한다(백엔드와 동일). */
export interface SearchHumansPageParams {
  page?: number;
  size?: number;
}

/** 대상자 검색 페이지 응답. 서버 메타가 없으면 안전한 기본값으로 채운다. */
export interface HumanPage {
  items: HumanSummary[];
  /** 1부터 시작하는 현재 페이지 번호 */
  page: number;
  size: number;
  totalElements: number;
  /** 전체 페이지 수(1 이상) */
  totalPages: number;
}

export interface CreateHumanRequest {
  name: string;
  gender: "M" | "F";
  birthDate: string;
  address: string | null;
  department: string;
}

export type UpdateHumanRequest = CreateHumanRequest;

export interface CreatedHuman {
  humanId: number;
}

export interface HumanRequestOptions {
  token?: string | null;
  signal?: AbortSignal;
}

// null/누락된 선택 필드는 빈 문자열로 통일하고, 문자열이 아닌 값은 무효(null)로 돌려준다.
function normalizeOptionalString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return "";
  }

  return typeof value === "string" ? value : null;
}

function normalizeHumanSummary(value: unknown): HumanSummary | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const { humanId, name, gender, birthDate, address, department } =
    value as Record<string, unknown>;

  // gender/address/department는 비어 있을 수 있으므로 humanId·name·birthDate만 필수로 검증한다.
  if (
    typeof humanId !== "number" ||
    !Number.isFinite(humanId) ||
    typeof name !== "string" ||
    typeof birthDate !== "string"
  ) {
    return null;
  }

  const normalizedGender = normalizeOptionalString(gender);
  const normalizedAddress = normalizeOptionalString(address);
  const normalizedDepartment = normalizeOptionalString(department);

  if (
    normalizedGender === null ||
    normalizedAddress === null ||
    normalizedDepartment === null
  ) {
    return null;
  }

  return {
    humanId,
    name,
    gender: normalizedGender,
    birthDate,
    address: normalizedAddress,
    department: normalizedDepartment,
  };
}

// 형식이 맞지 않는 행은 건너뛴다. 한 행 때문에 목록 전체가 실패하지 않게 한다.
function parseHumanSummaries(content: unknown[]): HumanSummary[] {
  const humans: HumanSummary[] = [];

  for (const row of content) {
    const human = normalizeHumanSummary(row);

    if (human) {
      humans.push(human);
    }
  }

  return humans;
}

// 서버 페이지 메타는 숫자가 아니거나 누락될 수 있으므로 안전한 기본값으로 보정한다.
function normalizeMetaInteger(
  value: unknown,
  fallback: number,
  min: number,
): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(min, Math.floor(value))
    : fallback;
}

export async function searchHumans(
  query: SearchHumansQuery = {},
  { token, signal }: HumanRequestOptions = {},
): Promise<HumanSummary[]> {
  const response = await request<unknown>(HUMAN_SEARCH_ENDPOINT, {
    method: "POST",
    body: query,
    token,
    signal,
    errorMessages: {
      400: HUMAN_SEARCH_BAD_REQUEST_MESSAGE,
      401: HUMAN_SEARCH_UNAUTHORIZED_MESSAGE,
    },
  });

  if (!response || typeof response !== "object") {
    throw new ApiError(200, HUMAN_SEARCH_INVALID_RESPONSE_MESSAGE);
  }

  const { content } = response as Record<string, unknown>;

  if (!Array.isArray(content)) {
    throw new ApiError(200, HUMAN_SEARCH_INVALID_RESPONSE_MESSAGE);
  }

  return parseHumanSummaries(content);
}

/**
 * 대상자 검색을 페이지 단위로 조회한다. 요청 본문에 page(1부터)·size 를 실어 보내고
 * 응답의 {content, page, size, totalElements, totalPages} 메타까지 돌려준다.
 * 메타가 없으면 요청값과 결과 건수로 안전하게 채운다.
 */
export async function searchHumansPaged(
  query: SearchHumansQuery = {},
  {
    page = 1,
    size = HUMAN_SEARCH_DEFAULT_PAGE_SIZE,
  }: SearchHumansPageParams = {},
  { token, signal }: HumanRequestOptions = {},
): Promise<HumanPage> {
  // 백엔드는 page 를 1부터 센다(@Positive). 0 이하를 보내면 400 이다.
  const requestedPage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  // size 는 1~100 사이여야 한다. 상한을 넘기면 백엔드가 400 을 낸다.
  const requestedSize = Math.min(
    HUMAN_SEARCH_MAX_PAGE_SIZE,
    normalizePositiveInteger(size, HUMAN_SEARCH_DEFAULT_PAGE_SIZE),
  );

  const response = await request<unknown>(HUMAN_SEARCH_ENDPOINT, {
    method: "POST",
    body: { ...query, page: requestedPage, size: requestedSize },
    token,
    signal,
    errorMessages: {
      400: HUMAN_SEARCH_BAD_REQUEST_MESSAGE,
      401: HUMAN_SEARCH_UNAUTHORIZED_MESSAGE,
    },
  });

  if (!response || typeof response !== "object" || Array.isArray(response)) {
    throw new ApiError(200, HUMAN_SEARCH_INVALID_RESPONSE_MESSAGE);
  }

  const record = response as Record<string, unknown>;

  if (!Array.isArray(record.content)) {
    throw new ApiError(200, HUMAN_SEARCH_INVALID_RESPONSE_MESSAGE);
  }

  const items = parseHumanSummaries(record.content);
  const resolvedSize = normalizeMetaInteger(record.size, requestedSize, 1);
  const totalElements = normalizeMetaInteger(
    record.totalElements,
    items.length,
    0,
  );
  // 응답 page 도 1부터다. 빈 결과(totalElements 0)는 totalPages 0 이 정상이므로
  // 서버가 준 값은 그대로 두고(min 0), 메타가 없을 때만 건수로 계산한다.
  const computedTotalPages = Math.ceil(totalElements / resolvedSize);

  return {
    items,
    page: normalizeMetaInteger(record.page, requestedPage, 1),
    size: resolvedSize,
    totalElements,
    totalPages: normalizeMetaInteger(record.totalPages, computedTotalPages, 0),
  };
}

export async function createHuman(
  body: CreateHumanRequest,
  { token, signal }: HumanRequestOptions = {},
): Promise<CreatedHuman> {
  // 201 Created, 본문은 { humanId }.
  const response = await request<unknown>(HUMAN_ENDPOINT, {
    method: "POST",
    body,
    token,
    signal,
    errorMessages: {
      400: HUMAN_CREATE_BAD_REQUEST_MESSAGE,
      401: HUMAN_CREATE_UNAUTHORIZED_MESSAGE,
      409: HUMAN_CREATE_CONFLICT_MESSAGE,
    },
  });

  if (!response || typeof response !== "object") {
    throw new ApiError(201, HUMAN_CREATE_INVALID_RESPONSE_MESSAGE);
  }

  const { humanId } = response as Record<string, unknown>;

  if (
    typeof humanId !== "number" ||
    !Number.isInteger(humanId) ||
    humanId <= 0
  ) {
    throw new ApiError(201, HUMAN_CREATE_INVALID_RESPONSE_MESSAGE);
  }

  return { humanId };
}

export async function updateHuman(
  humanId: number,
  body: UpdateHumanRequest,
  { token, signal }: HumanRequestOptions = {},
): Promise<void> {
  // 204 No Content 응답이라 본문 검증 없이 성공으로 처리한다.
  await request<unknown>(getHumanUpdateEndpoint(humanId), {
    method: "PUT",
    body,
    token,
    signal,
    errorMessages: {
      400: HUMAN_UPDATE_BAD_REQUEST_MESSAGE,
      401: HUMAN_UPDATE_UNAUTHORIZED_MESSAGE,
      404: HUMAN_UPDATE_NOT_FOUND_MESSAGE,
      409: HUMAN_UPDATE_CONFLICT_MESSAGE,
    },
  });
}

export async function deleteHuman(
  humanId: number,
  { token, signal }: HumanRequestOptions = {},
): Promise<void> {
  // 204 No Content 응답이라 본문 검증 없이 성공으로 처리한다.
  await request<unknown>(getHumanDeleteEndpoint(humanId), {
    method: "DELETE",
    token,
    signal,
    errorMessages: {
      401: HUMAN_DELETE_UNAUTHORIZED_MESSAGE,
      403: HUMAN_DELETE_FORBIDDEN_MESSAGE,
      404: HUMAN_DELETE_NOT_FOUND_MESSAGE,
      // 재직 이력이나 발급 기록이 연결돼 있으면 백엔드가 409 로 삭제를 거절한다(#64).
      HUMAN_HAS_ISSUED_CERTIFICATE: HUMAN_DELETE_HAS_ISSUED_MESSAGE,
      HUMAN_HAS_CERTIFICATE: HUMAN_DELETE_HAS_CAREER_MESSAGE,
      409: HUMAN_DELETE_CONFLICT_MESSAGE,
    },
  });
}
