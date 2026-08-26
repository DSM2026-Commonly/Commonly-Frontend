import { ApiError, request } from "./api";

export const ADMIN_USERS_ENDPOINT = "/api/admins";
export const ADMIN_USER_CREATE_ENDPOINT = "/api/admin/users";

// 백엔드가 신규 계정에 설정하는 초기 비밀번호(명세 고정값). 프론트는 안내 용도로만 사용한다.
export const ADMIN_USER_INITIAL_PASSWORD = "abcd1234";

// 목록 조회는 /api/admins, 삭제는 /api/admin/users/{userId} — 백엔드 명세의 경로 비대칭을 그대로 따른다.
export function getAdminUserDeleteEndpoint(userId: number): string {
  return `/api/admin/users/${userId}`;
}

export const ADMIN_USERS_INVALID_RESPONSE_MESSAGE =
  "사용자 조회 응답이 올바르지 않습니다.";
export const ADMIN_USERS_BAD_REQUEST_MESSAGE =
  "사용자 조회 요청이 올바르지 않습니다. 검색어를 확인해 주세요.";
export const ADMIN_USERS_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const ADMIN_USERS_FORBIDDEN_MESSAGE = "사용자 조회 권한이 없습니다.";
export const ADMIN_USER_CREATE_BAD_REQUEST_MESSAGE =
  "등록 요청이 올바르지 않습니다. 입력값을 확인해 주세요.";
export const ADMIN_USER_CREATE_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const ADMIN_USER_CREATE_CONFLICT_MESSAGE =
  "이미 사용 중인 아이디입니다.";
export const ADMIN_USER_DELETE_BAD_REQUEST_MESSAGE =
  "삭제 요청이 올바르지 않습니다. 사용자를 다시 조회한 뒤 시도해 주세요.";
export const ADMIN_USER_DELETE_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const ADMIN_USER_DELETE_FORBIDDEN_MESSAGE =
  "사용자 삭제 권한이 없습니다.";
export const ADMIN_USER_DELETE_NOT_FOUND_MESSAGE =
  "삭제할 사용자를 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.";

export interface AdminUser {
  userId: number;
  accountId: string;
  name: string;
  department: string;
}

function normalizeAdminUser(value: unknown): AdminUser | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const { userId, accountId, name, department } = value as Record<
    string,
    unknown
  >;

  if (
    typeof userId !== "number" ||
    !Number.isFinite(userId) ||
    typeof accountId !== "string" ||
    typeof name !== "string" ||
    typeof department !== "string"
  ) {
    return null;
  }

  return { userId, accountId, name, department };
}

// 무관한 불량 행 하나가 정상 사용자 조회를 막지 않도록 행 단위 오류는 건너뛰고,
// 최상위가 배열이 아닐 때만 응답 오류로 처리한다.
function normalizeAdminUsers(value: unknown): AdminUser[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const users: AdminUser[] = [];

  for (const row of value) {
    const user = normalizeAdminUser(row);

    if (user) {
      users.push(user);
    }
  }

  return users;
}

export interface AdminUserRequestOptions {
  token?: string | null;
  signal?: AbortSignal;
}

export interface FetchAdminUsersOptions extends AdminUserRequestOptions {
  page?: number;
  size?: number;
}

export async function fetchAdminUsers(
  keyword: string,
  { page = 1, size = 100, token, signal }: FetchAdminUsersOptions = {},
): Promise<AdminUser[]> {
  const response = await request<unknown>(
    `${ADMIN_USERS_ENDPOINT}?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`,
    {
      token,
      signal,
      errorMessages: {
        400: ADMIN_USERS_BAD_REQUEST_MESSAGE,
        401: ADMIN_USERS_UNAUTHORIZED_MESSAGE,
        403: ADMIN_USERS_FORBIDDEN_MESSAGE,
      },
    },
  );

  const users = normalizeAdminUsers(response);

  if (!users) {
    throw new ApiError(200, ADMIN_USERS_INVALID_RESPONSE_MESSAGE);
  }

  return users;
}

export interface CreateAdminUserRequest {
  accountId: string;
  name: string;
  department: string;
}

// 초기 비밀번호는 백엔드가 abcd1234로 설정하므로 프론트는 전송하지 않는다.
export async function createAdminUser(
  user: CreateAdminUserRequest,
  { token, signal }: AdminUserRequestOptions = {},
): Promise<void> {
  await request<unknown>(ADMIN_USER_CREATE_ENDPOINT, {
    method: "POST",
    body: user,
    token,
    signal,
    errorMessages: {
      400: ADMIN_USER_CREATE_BAD_REQUEST_MESSAGE,
      401: ADMIN_USER_CREATE_UNAUTHORIZED_MESSAGE,
      409: ADMIN_USER_CREATE_CONFLICT_MESSAGE,
    },
  });
}

export async function deleteAdminUser(
  userId: number,
  { token, signal }: AdminUserRequestOptions = {},
): Promise<void> {
  await request<unknown>(getAdminUserDeleteEndpoint(userId), {
    method: "DELETE",
    token,
    signal,
    errorMessages: {
      400: ADMIN_USER_DELETE_BAD_REQUEST_MESSAGE,
      401: ADMIN_USER_DELETE_UNAUTHORIZED_MESSAGE,
      403: ADMIN_USER_DELETE_FORBIDDEN_MESSAGE,
      404: ADMIN_USER_DELETE_NOT_FOUND_MESSAGE,
    },
  });
}
