import { ApiError, request } from "./api";

export const HUMAN_SEARCH_ENDPOINT = "/api/human/search";

export function getHumanUpdateEndpoint(humanId: number): string {
  return `/api/human/${humanId}`;
}

export const HUMAN_SEARCH_INVALID_RESPONSE_MESSAGE =
  "대상자 조회 응답이 올바르지 않습니다.";
export const HUMAN_SEARCH_BAD_REQUEST_MESSAGE =
  "검색 조건이 올바르지 않습니다. 생년월일 범위를 확인해 주세요.";
export const HUMAN_SEARCH_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const HUMAN_UPDATE_BAD_REQUEST_MESSAGE =
  "입력값이 올바르지 않습니다. 입력 내용을 확인해 주세요.";
export const HUMAN_UPDATE_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const HUMAN_UPDATE_NOT_FOUND_MESSAGE =
  "대상자의 인적사항을 찾을 수 없습니다. 다시 조회해 주세요.";
export const HUMAN_UPDATE_CONFLICT_MESSAGE =
  "동일한 성명과 생년월일의 인적사항이 이미 존재합니다.";

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

export interface UpdateHumanRequest {
  name: string;
  gender: "M" | "F";
  birthDate: string;
  address: string | null;
  department: string;
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

  const humans: HumanSummary[] = [];

  for (const row of content) {
    const human = normalizeHumanSummary(row);

    if (human) {
      humans.push(human);
    }
  }

  return humans;
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
