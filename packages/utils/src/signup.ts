import { ApiError, request } from "./api";
import type { AuthTokens } from "./auth";
import { normalizeToken } from "./login";

export const SIGNUP_ENDPOINT = "/api/auths/signup";

export const SIGNUP_BAD_REQUEST_MESSAGE =
  "입력한 정보가 조건에 맞지 않습니다. 아이디와 비밀번호를 확인해주세요.";
export const SIGNUP_UNAUTHORIZED_MESSAGE =
  "아이디 또는 비밀번호가 맞지 않습니다.";
export const SIGNUP_INVALID_RESPONSE_MESSAGE =
  "회원가입 응답이 올바르지 않습니다.";

export interface SignupRequest {
  accountId: string;
  password: string;
  /** 20자 이내 */
  name: string;
  /** 010-1234-5678 형식 */
  phoneNumber: string;
  /** ISO LocalDate (예: 1995-04-12) */
  birthDate: string;
}

export type SignupResponse = AuthTokens;

export async function signup(
  credentials: SignupRequest,
  signal?: AbortSignal,
): Promise<SignupResponse> {
  const response = await request<Partial<SignupResponse>>(SIGNUP_ENDPOINT, {
    method: "POST",
    body: credentials,
    signal,
    errorMessages: {
      400: SIGNUP_BAD_REQUEST_MESSAGE,
      401: SIGNUP_UNAUTHORIZED_MESSAGE,
    },
  });

  const accessToken = normalizeToken(response?.accessToken);
  const refreshToken = normalizeToken(response?.refreshToken);

  if (!accessToken || !refreshToken) {
    throw new ApiError(200, SIGNUP_INVALID_RESPONSE_MESSAGE);
  }

  return { accessToken, refreshToken };
}
