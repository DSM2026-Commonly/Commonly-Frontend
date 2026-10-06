import { ApiError, isInitialPasswordNotChangedError, request } from "./api";
import { fetchMe } from "./users";

/** 초기 비밀번호 변경. 초기 비밀번호 상태의 직원 계정이 유일하게 호출할 수 있는 API 다. */
export const INITIAL_PASSWORD_CHANGE_ENDPOINT = "/api/admin/password";

export const INITIAL_PASSWORD_CHANGE_BAD_REQUEST_MESSAGE =
  "비밀번호 형식이 올바르지 않습니다. 8자 이상 72자 이하로 입력해 주세요.";
export const INITIAL_PASSWORD_CHANGE_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const INITIAL_PASSWORD_CHANGE_FORBIDDEN_MESSAGE =
  "비밀번호를 변경할 권한이 없습니다.";

export const INITIAL_PASSWORD_MIN_LENGTH = 8;
export const INITIAL_PASSWORD_MAX_LENGTH = 72;

/** 로그인한 본인의 비밀번호 변경. 경로의 userId 가 본인이 아니면 403 이다. */
export function getPasswordChangeEndpoint(userId: number): string {
  return `/api/auths/password/${userId}`;
}

export const PASSWORD_CHANGE_BAD_REQUEST_MESSAGE =
  "비밀번호 형식이 올바르지 않습니다. 새 비밀번호는 8자 이상 72자 이하로 입력해 주세요.";
// 백엔드는 현재 비밀번호가 틀려도 로그인 실패와 같은 401("아이디 또는 비밀번호가 일치하지 않습니다.")을
// 준다. 이 화면에는 아이디 입력이 없어 현재 비밀번호 문구로 바꿔 보여준다.
export const PASSWORD_CHANGE_UNAUTHORIZED_MESSAGE =
  "현재 비밀번호가 일치하지 않습니다.";
export const PASSWORD_CHANGE_FORBIDDEN_MESSAGE =
  "본인의 계정만 비밀번호를 변경할 수 있습니다.";

export interface ChangePasswordRequest {
  /** 현재 비밀번호 */
  password: string;
  newPassword: string;
}

export interface ChangeInitialPasswordRequest {
  password: string;
}

export interface ChangeInitialPasswordOptions {
  token?: string | null;
  signal?: AbortSignal;
}

/**
 * 초기 비밀번호를 새 비밀번호로 바꾼다 (PATCH /api/admin/password).
 * 성공 시 본문 없이 200 이 온다. 이후부터 다른 API 를 쓸 수 있다.
 */
export async function changeInitialPassword(
  { password }: ChangeInitialPasswordRequest,
  { token, signal }: ChangeInitialPasswordOptions = {},
): Promise<void> {
  await request<unknown>(INITIAL_PASSWORD_CHANGE_ENDPOINT, {
    method: "PATCH",
    body: { password },
    token,
    signal,
    errorMessages: {
      400: INITIAL_PASSWORD_CHANGE_BAD_REQUEST_MESSAGE,
      401: INITIAL_PASSWORD_CHANGE_UNAUTHORIZED_MESSAGE,
      403: INITIAL_PASSWORD_CHANGE_FORBIDDEN_MESSAGE,
    },
  });
}

/**
 * 로그인한 본인의 비밀번호를 바꾼다 (PATCH /api/auths/password/{userId}).
 * 현재 비밀번호를 함께 보내야 하고, 성공 시 본문 없이 200 이 온다.
 * 현재 비밀번호가 틀리면 401 이지만 토큰은 유효하므로 로그아웃되지 않는다.
 */
export async function changePassword(
  userId: number,
  { password, newPassword }: ChangePasswordRequest,
  { token, signal }: ChangeInitialPasswordOptions = {},
): Promise<void> {
  await request<unknown>(getPasswordChangeEndpoint(userId), {
    method: "PATCH",
    body: { password, newPassword },
    token,
    signal,
    errorMessages: {
      400: PASSWORD_CHANGE_BAD_REQUEST_MESSAGE,
      401: PASSWORD_CHANGE_UNAUTHORIZED_MESSAGE,
      403: PASSWORD_CHANGE_FORBIDDEN_MESSAGE,
    },
  });
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/**
 * 로그인 직후 초기 비밀번호 변경이 필요한 계정인지 확인한다.
 * 내 정보(GET /api/users/me)의 passwordChanged 로 판단한다. 민원인은 직접 가입해 초기 비밀번호가
 * 없으므로 대상이 아니다.
 * 내 정보 조회가 실패하면(아직 그 API 가 없는 배포본 등) 예전처럼 직원 공통 권한(ADMIN/USER)의
 * 가벼운 조회 API 를 한 번 호출해 InitialPasswordFilter 의 403 인지로 판단한다.
 * 그 외의 실패(네트워크, 권한 없음 등)는 "변경 불필요"로 보고 원래 흐름을 막지 않는다.
 */
export async function requiresInitialPasswordChange({
  token,
  signal,
}: ChangeInitialPasswordOptions = {}): Promise<boolean> {
  try {
    const me = await fetchMe({ token, signal });
    return me.authority !== "PETITIONER" && !me.passwordChanged;
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
  }

  try {
    await request<unknown>("/api/issuance-histories?page=1&size=1", {
      token,
      signal,
    });
    return false;
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    return (
      error instanceof ApiError &&
      isInitialPasswordNotChangedError(error.status, {
        message: error.message,
      })
    );
  }
}
