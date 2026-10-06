import { ApiError, request } from "./api";

export const LOGIN_ENDPOINT = "/api/auths/login";

export const ACCOUNT_ID_PATTERN = /^[a-zA-Z0-9]{4,12}$/;
export const PASSWORD_MIN_LENGTH = 8;

export const ACCOUNT_ID_FORMAT_MESSAGE =
  "아이디는 영문과 숫자로 4~12자 입력해주세요.";
export const PASSWORD_FORMAT_MESSAGE = `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상 입력해주세요.`;
export const LOGIN_BAD_REQUEST_MESSAGE =
  "입력한 정보가 조건에 맞지 않습니다. 아이디와 비밀번호를 확인해주세요.";
export const LOGIN_UNAUTHORIZED_MESSAGE =
  "아이디 또는 비밀번호가 맞지 않습니다.";

export interface LoginRequest {
  accountId: string;
  password: string;
}

// 액세스 토큰(JWT, 1시간)과 재발급용 리프레시 토큰(14일)을 함께 받는다.
// 예전 배포본은 리프레시 토큰을 주지 않아 null 일 수 있다.
export interface LoginResponse {
  accessToken: string;
  refreshToken: string | null;
}

export function isValidAccountId(accountId: string): boolean {
  return ACCOUNT_ID_PATTERN.test(accountId);
}

export function isValidPassword(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH;
}

export async function login(
  credentials: LoginRequest,
  signal?: AbortSignal,
): Promise<LoginResponse> {
  const response = await request<Partial<LoginResponse>>(LOGIN_ENDPOINT, {
    method: "POST",
    body: credentials,
    signal,
    errorMessages: {
      400: LOGIN_BAD_REQUEST_MESSAGE,
      401: LOGIN_UNAUTHORIZED_MESSAGE,
    },
  });

  const accessToken = normalizeToken(response?.accessToken);

  if (!accessToken) {
    throw new ApiError(200, "로그인 응답이 올바르지 않습니다.");
  }

  return { accessToken, refreshToken: normalizeToken(response?.refreshToken) };
}

export function normalizeToken(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
