import { ApiError, request } from "./api";

export const HUMAN_SEARCH_ENDPOINT = "/api/human/search";

export const HUMAN_SEARCH_INVALID_RESPONSE_MESSAGE =
  "대상자 조회 응답이 올바르지 않습니다.";
export const HUMAN_SEARCH_BAD_REQUEST_MESSAGE =
  "검색 조건이 올바르지 않습니다. 생년월일 범위를 확인해 주세요.";
export const HUMAN_SEARCH_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";

export interface HumanSummary {
  humanId: number;
  name: string;
  gender: string;
  birthDate: string;
  address: string;
}

export interface SearchHumansQuery {
  name?: string;
  gender?: string;
  birthDateFrom?: string;
  birthDateTo?: string;
  address?: string;
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

  const { humanId, name, gender, birthDate, address } = value as Record<
    string,
    unknown
  >;

  // gender/address는 명세상 nullable이므로 humanId·name·birthDate만 필수로 검증한다.
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

  if (normalizedGender === null || normalizedAddress === null) {
    return null;
  }

  return {
    humanId,
    name,
    gender: normalizedGender,
    birthDate,
    address: normalizedAddress,
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
