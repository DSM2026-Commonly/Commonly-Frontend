import {
  normalizePageEnvelope,
  normalizePositiveInteger,
  request,
} from "./api";

export const ADMIN_USERS_ENDPOINT = "/api/admins";

export const ADMIN_USERS_DEFAULT_PAGE_SIZE = 10;

export const ADMIN_USERS_UNAUTHORIZED_MESSAGE =
  "사용자 목록을 조회할 권한이 없습니다. 다시 로그인해 주세요.";
export const ADMIN_USERS_INVALID_RESPONSE_MESSAGE =
  "사용자 목록 응답이 올바르지 않습니다.";

export interface AdminUserSummary {
  userId: number;
  accountId: string;
  name: string;
  department: string;
}

export interface AdminUserPage {
  content: AdminUserSummary[];
  /** 서버가 전체 건수를 주지 않으면 현재 페이지 건수 */
  totalCount: number;
  /** 서버가 전체 페이지 수를 주지 않으면 null */
  totalPages: number | null;
  /**
   * 다음 페이지가 있을 가능성. 전체 페이지 수를 알면 그것으로,
   * 모르면 "요청한 size 만큼 꽉 찼는지"로 판단한다.
   */
  hasNextPage: boolean;
}

export interface FetchAdminUsersParams {
  /** 1부터 시작하는 페이지 번호 */
  page?: number;
  size?: number;
  /** 이름 검색어. 비어 있으면 전송하지 않는다. */
  keyword?: string;
}

export interface FetchAdminUsersOptions {
  token?: string | null;
  signal?: AbortSignal;
}

function normalizeAdminUser(value: unknown): AdminUserSummary | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const { userId, accountId, name, department } = value as Record<
    string,
    unknown
  >;

  if (typeof userId !== "number" || !Number.isFinite(userId)) {
    return null;
  }

  return {
    userId,
    accountId: typeof accountId === "string" ? accountId : "",
    name: typeof name === "string" ? name : "",
    department: typeof department === "string" ? department : "",
  };
}

export function buildAdminUsersPath({
  page = 1,
  size = ADMIN_USERS_DEFAULT_PAGE_SIZE,
  keyword = "",
}: FetchAdminUsersParams = {}): string {
  const searchParams = new URLSearchParams({
    page: String(normalizePositiveInteger(page, 1)),
    size: String(normalizePositiveInteger(size, ADMIN_USERS_DEFAULT_PAGE_SIZE)),
  });
  const trimmedKeyword = keyword.trim();

  if (trimmedKeyword) {
    searchParams.set("keyword", trimmedKeyword);
  }

  return `${ADMIN_USERS_ENDPOINT}?${searchParams.toString()}`;
}

/** 어드민 권한으로 사용자 목록을 페이지 단위로 조회한다. */
export async function fetchAdminUsers(
  params: FetchAdminUsersParams = {},
  { token, signal }: FetchAdminUsersOptions = {},
): Promise<AdminUserPage> {
  const response = await request<unknown>(buildAdminUsersPath(params), {
    token,
    signal,
    errorMessages: {
      401: ADMIN_USERS_UNAUTHORIZED_MESSAGE,
      403: ADMIN_USERS_UNAUTHORIZED_MESSAGE,
    },
  });

  // 백엔드(GET /api/admins)는 페이지 메타 없이 배열만 내려준다.
  // 명세의 {content, totalCount, totalPages} 형태도 함께 받는다.
  const { content, totalCount, totalPages } = normalizePageEnvelope(
    response,
    ADMIN_USERS_INVALID_RESPONSE_MESSAGE,
  );

  const users: AdminUserSummary[] = [];

  for (const item of content) {
    const user = normalizeAdminUser(item);

    // 형식이 맞지 않는 행은 건너뛴다(humans 와 동일 정책). 한 행 때문에 목록 전체가 실패하지 않게 한다.
    if (user) {
      users.push(user);
    }
  }

  const knownTotalPages =
    typeof totalPages === "number" && Number.isFinite(totalPages)
      ? Math.max(1, Math.floor(totalPages))
      : null;
  const requestedPage = normalizePositiveInteger(params.page ?? 1, 1);
  const requestedSize = normalizePositiveInteger(
    params.size ?? ADMIN_USERS_DEFAULT_PAGE_SIZE,
    ADMIN_USERS_DEFAULT_PAGE_SIZE,
  );

  return {
    content: users,
    totalCount:
      typeof totalCount === "number" && Number.isFinite(totalCount)
        ? Math.max(0, Math.floor(totalCount))
        : users.length,
    totalPages: knownTotalPages,
    hasNextPage:
      knownTotalPages === null
        ? // 형식이 맞지 않아 걸러낸 행도 서버가 내려준 한 페이지 분량이므로
          // 다음 페이지 존재 여부는 원본 응답 행 수로 판단한다.
          content.length >= requestedSize
        : requestedPage < knownTotalPages,
  };
}
