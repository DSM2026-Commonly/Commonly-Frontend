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

function normalizeHumanSummary(value: unknown): HumanSummary | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const { humanId, name, gender, birthDate, address } = value as Record<
    string,
    unknown
  >;

  if (
    typeof humanId !== "number" ||
    !Number.isFinite(humanId) ||
    typeof name !== "string" ||
    typeof gender !== "string" ||
    typeof birthDate !== "string" ||
    typeof address !== "string"
  ) {
    return null;
  }

  return { humanId, name, gender, birthDate, address };
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
