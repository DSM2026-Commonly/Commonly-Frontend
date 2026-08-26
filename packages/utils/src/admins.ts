import { ApiError, normalizePositiveInteger, request } from "./api";

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
  totalCount: number;
  totalPages: number;
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

  if (!response || typeof response !== "object" || Array.isArray(response)) {
    throw new ApiError(200, ADMIN_USERS_INVALID_RESPONSE_MESSAGE);
  }

  const { content, totalCount, totalPages } = response as Record<
    string,
    unknown
  >;

  if (!Array.isArray(content)) {
    throw new ApiError(200, ADMIN_USERS_INVALID_RESPONSE_MESSAGE);
  }

  const users: AdminUserSummary[] = [];

  for (const item of content) {
    const user = normalizeAdminUser(item);

    if (!user) {
      throw new ApiError(200, ADMIN_USERS_INVALID_RESPONSE_MESSAGE);
    }

    users.push(user);
  }

  return {
    content: users,
    totalCount:
      typeof totalCount === "number" && Number.isFinite(totalCount)
        ? Math.max(0, Math.floor(totalCount))
        : users.length,
    totalPages:
      typeof totalPages === "number" && Number.isFinite(totalPages)
        ? Math.max(1, Math.floor(totalPages))
        : 1,
  };
}
