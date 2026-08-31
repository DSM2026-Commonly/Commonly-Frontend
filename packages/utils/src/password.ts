import { ApiError, isInitialPasswordNotChangedError, request } from "./api";

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
 * 로그인 직후 초기 비밀번호 변경이 필요한 계정인지 확인한다.
 * 백엔드가 토큰/로그인 응답에 그 정보를 주지 않아, 직원 공통 권한(ADMIN/USER)의 가장 가벼운
 * 조회 API 를 한 번 호출해 InitialPasswordFilter 의 403 인지로 판단한다.
 * 그 외의 실패(네트워크, 권한 없음 등)는 "변경 불필요"로 보고 원래 흐름을 막지 않는다.
 */
export async function requiresInitialPasswordChange({
  token,
  signal,
}: ChangeInitialPasswordOptions = {}): Promise<boolean> {
  try {
    await request<unknown>("/api/issuance-histories?page=1&size=1", {
      token,
      signal,
    });
    return false;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
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
