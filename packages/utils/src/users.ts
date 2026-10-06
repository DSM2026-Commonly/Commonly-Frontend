import { ApiError, request } from "./api";

export const ME_ENDPOINT = "/api/users/me";

export const ME_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const ME_INVALID_RESPONSE_MESSAGE =
  "내 정보 응답이 올바르지 않습니다.";

/**
 * 로그인한 사용자 정보(GET /api/users/me).
 * JWT 에는 계정 id 만 있어 실명·생년월일은 이 API 로만 알 수 있다.
 */
export interface Me {
  userId: number;
  accountId: string;
  /** 실명 */
  name: string;
  /** ADMIN / USER / PETITIONER */
  authority: string;
  /** 초기 비밀번호를 바꿨는지. 직원 계정만 의미가 있다. */
  passwordChanged: boolean;
  /** 직원 계정의 부서. 민원인은 null. */
  department: string | null;
  /** 민원인 연락처. 직원은 null. */
  phoneNumber: string | null;
  /** 민원인 생년월일(YYYY-MM-DD). 직원은 null. */
  birthDate: string | null;
}

export interface UserRequestOptions {
  token?: string | null;
  signal?: AbortSignal;
}

function normalizeNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function normalizeMe(value: unknown): Me | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const { userId, accountId, name, authority, passwordChanged, department, phoneNumber, birthDate } =
    value as Record<string, unknown>;

  // 화면이 실제로 쓰는 식별·표시 값만 필수로 본다.
  if (
    typeof userId !== "number" ||
    !Number.isFinite(userId) ||
    typeof accountId !== "string" ||
    typeof name !== "string"
  ) {
    return null;
  }

  return {
    userId,
    accountId,
    name,
    authority: typeof authority === "string" ? authority : "",
    passwordChanged: passwordChanged !== false,
    department: normalizeNullableString(department),
    phoneNumber: normalizeNullableString(phoneNumber),
    birthDate: normalizeNullableString(birthDate),
  };
}

export async function fetchMe({
  token,
  signal,
}: UserRequestOptions = {}): Promise<Me> {
  const response = await request<unknown>(ME_ENDPOINT, {
    token,
    signal,
    errorMessages: {
      401: ME_UNAUTHORIZED_MESSAGE,
    },
  });

  const me = normalizeMe(response);

  if (!me) {
    throw new ApiError(200, ME_INVALID_RESPONSE_MESSAGE);
  }

  return me;
}
