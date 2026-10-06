import {
  clearRefreshToken,
  getAuthToken,
  getRefreshToken,
  setAuthTokens,
} from "./auth";
import { decodeJwtPayload } from "./authSession";

const DEFAULT_API_BASE_URL = "";

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  return (configured || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

export interface ApiErrorBody {
  code?: string;
  message?: string;
  detail?: unknown;
  /** 검증 실패 응답의 `error` 맵(필드명 → 안내 문구). 검증 실패가 아니면 없다. */
  fieldErrors?: Record<string, string>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly detail?: unknown;
  readonly fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = body?.code;
    this.detail = body?.detail;
    this.fieldErrors = body?.fieldErrors;
  }
}

export const NETWORK_ERROR_MESSAGE =
  "서버에 연결할 수 없습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.";
export const SERVER_ERROR_MESSAGE =
  "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";

/**
 * 에러 메시지 매핑. 숫자 키는 HTTP 상태 코드, 문자열 키는 응답 본문의 `code`.
 * 응답 본문의 `code`가 먼저 매칭되고, 없으면 상태 코드로 매칭된다.
 */
/** 유한한 양의 정수로 정규화한다. 유한하지 않으면 기본값을 사용한다. */
export function normalizePositiveInteger(
  value: number,
  fallback: number,
): number {
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : fallback;
}

/** 인증 요청이 401 로 실패했을 때 window 에 발행되는 이벤트 이름. 레이아웃이 받아 로그인 화면으로 보낸다. */
export const UNAUTHORIZED_EVENT = "commonly:unauthorized";
/**
 * 초기 비밀번호를 아직 바꾸지 않은 직원 계정이 다른 API 를 호출해 403 을 받았을 때 발행되는 이벤트 이름.
 * 레이아웃이 받아 비밀번호 변경 화면으로 보낸다.
 */
export const PASSWORD_CHANGE_REQUIRED_EVENT = "commonly:password-change-required";
/** 백엔드 InitialPasswordFilter 가 내려주는 메시지. 화면 안내에 쓴다(판정은 code 로 한다). */
export const INITIAL_PASSWORD_NOT_CHANGED_MESSAGE =
  "초기 비밀번호를 변경한 후 이용할 수 있습니다.";
export const INITIAL_PASSWORD_NOT_CHANGED_CODE = "INITIAL_PASSWORD_NOT_CHANGED";

/**
 * 토큰 자체가 문제인 401 의 code. 이때만 세션이 끝난 것으로 본다.
 * 비밀번호 불일치(PASSWORD_MISMATCH)처럼 토큰은 멀쩡한 401 도 있기 때문이다.
 */
const SESSION_ENDED_CODES = new Set([
  "UNAUTHORIZED",
  "EXPIRED_TOKEN",
  "INVALID_TOKEN",
]);
export const EXPIRED_TOKEN_CODE = "EXPIRED_TOKEN";

function dispatchWindowEvent(name: string): void {
  if (typeof window === "undefined" || typeof CustomEvent === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(name));
}

/**
 * 401 이 세션 종료(로그인 화면으로 보낼 상황)인지.
 * 백엔드는 권한 부족을 403 으로, 미인증·만료·위조 토큰을 401 + code 로 구분해 준다.
 * 토큰 형식이 바뀐 배포 직후처럼 만료 시각이 남은 토큰도 무효일 수 있으므로 토큰 만료 시각은 보지 않는다.
 * 비밀번호 불일치(PASSWORD_MISMATCH)처럼 토큰과 무관한 401 만 세션을 유지한다.
 */
export function isSessionEndedError(
  status: number,
  body: ApiErrorBody,
): boolean {
  return status === 401 && (!body.code || SESSION_ENDED_CODES.has(body.code));
}

export function isInitialPasswordNotChangedError(
  status: number,
  body: ApiErrorBody,
): boolean {
  return status === 403 && body.code === INITIAL_PASSWORD_NOT_CHANGED_CODE;
}

/**
 * 목록 응답을 `{content, totalCount, totalPages, hasNext}` 로 정규화한다.
 * 백엔드 `PageResponse` 는 `{content, page, size, totalElements, totalPages, hasNext}`(page 는 1부터)다.
 * 예전 배포본처럼 배열만 내려주거나, 명세의 `totalCount`·`totalPage` 이름으로 오는 경우도 받는다.
 */
export function normalizePageEnvelope(
  response: unknown,
  invalidMessage: string,
  totalPagesKey: "totalPages" | "totalPage" = "totalPages",
): {
  content: unknown[];
  totalCount: unknown;
  totalPages: unknown;
  totalPage: unknown;
  hasNext: unknown;
} {
  if (Array.isArray(response)) {
    return {
      content: response,
      totalCount: undefined,
      totalPages: undefined,
      totalPage: undefined,
      hasNext: undefined,
    };
  }

  if (!response || typeof response !== "object") {
    throw new ApiError(200, invalidMessage);
  }

  const record = response as Record<string, unknown>;

  if (!Array.isArray(record.content)) {
    throw new ApiError(200, invalidMessage);
  }

  // 키 이름이 엔드포인트·버전마다 달라 둘 다 본다(PageResponse 는 totalElements·totalPages).
  const totalPages =
    record[totalPagesKey] ?? record.totalPages ?? record.totalPage;

  return {
    content: record.content,
    totalCount: record.totalCount ?? record.totalElements,
    totalPages,
    totalPage: totalPages,
    hasNext: record.hasNext,
  };
}

export type ErrorMessageMap = Partial<Record<number | string, string>>;

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
  errorMessages?: ErrorMessageMap;
}

async function throwErrorResponse(
  response: Response,
  errorMessages: ErrorMessageMap,
  { notifySession = true }: { notifySession?: boolean } = {},
): Promise<never> {
  const errorBody = await parseErrorBody(response);
  // 백엔드 에러 본문은 {code, status, timestamp, message} 형식이다.
  // 검증 실패만 {code, status, timestamp, error: {필드: 문구}} 로 message 없이 온다. 이때는
  // 상태코드 매핑("입력값이 올바르지 않습니다")보다 어느 칸이 왜 틀렸는지 짚어주는
  // 백엔드 문구가 정확하므로 먼저 쓴다.
  const message =
    (errorBody.code ? errorMessages[errorBody.code] : undefined) ??
    formatFieldErrors(errorBody.fieldErrors) ??
    errorMessages[response.status] ??
    (errorBody.message?.trim() || undefined) ??
    SERVER_ERROR_MESSAGE;

  if (notifySession && isSessionEndedError(response.status, errorBody)) {
    dispatchWindowEvent(UNAUTHORIZED_EVENT);
  } else if (
    notifySession &&
    isInitialPasswordNotChangedError(response.status, errorBody)
  ) {
    dispatchWindowEvent(PASSWORD_CHANGE_REQUIRED_EVENT);
  }

  throw new ApiError(
    response.status,
    // 초기 비밀번호 미변경 403 은 화면별 문구 매핑보다 백엔드 안내가 정확하다.
    isInitialPasswordNotChangedError(response.status, errorBody)
      ? INITIAL_PASSWORD_NOT_CHANGED_MESSAGE
      : message,
    errorBody,
  );
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    const body: unknown = await response.json();

    if (!body || typeof body !== "object") {
      return {};
    }

    const { code, message, detail, error } = body as Record<string, unknown>;

    return {
      code: typeof code === "string" ? code : undefined,
      message: typeof message === "string" ? message : undefined,
      detail,
      fieldErrors: parseFieldErrors(error),
    };
  } catch {
    return {};
  }
}

/**
 * 검증 실패 응답(ValidationErrorResponse)의 `error` 맵을 읽는다.
 * 이 맵을 버리면 백엔드가 짚어준 필드별 사유가 전부 사라져 400 이 서버 장애처럼 보인다.
 */
function parseFieldErrors(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const fieldErrors: Record<string, string> = {};

  for (const [field, fieldMessage] of Object.entries(value)) {
    if (typeof fieldMessage === "string" && fieldMessage.trim()) {
      fieldErrors[field] = fieldMessage.trim();
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

/**
 * 필드별 검증 문구를 한 줄로 합친다.
 * 필드명은 백엔드 식별자(`divisionValid` 등)라 사용자에게 보여주지 않고 문구만 쓴다.
 * 백엔드가 HashMap 으로 담아 순서가 들쭉날쭉하므로 필드명으로 정렬해 같은 순서로 보여준다.
 */
function formatFieldErrors(
  fieldErrors: Record<string, string> | undefined,
): string | undefined {
  if (!fieldErrors) {
    return undefined;
  }

  return Object.keys(fieldErrors)
    .sort()
    .map((field) => fieldErrors[field])
    .join(" ");
}

export const REISSUE_ENDPOINT = "/api/auths/reissue";
export const SESSION_EXTEND_FAILED_MESSAGE =
  "로그인 시간을 연장할 수 없습니다. 다시 로그인해 주세요.";

let pendingReissue: Promise<string> | null = null;

function readTokenField(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function performReissue(): Promise<string> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new ApiError(401, SESSION_EXTEND_FAILED_MESSAGE);
  }

  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}${REISSUE_ENDPOINT}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    throw new ApiError(0, NETWORK_ERROR_MESSAGE);
  }

  if (!response.ok) {
    // 이미 쓴(회전된) 토큰이나 만료된 토큰은 다시 써도 실패하므로 지운다.
    if (response.status === 401 || response.status === 404) {
      clearRefreshToken(refreshToken);
    }

    // 연장 실패는 화면에서 안내한다. 액세스 토큰은 아직 유효할 수 있어 세션을 끝내지 않는다.
    await throwErrorResponse(
      response,
      {
        401: SESSION_EXTEND_FAILED_MESSAGE,
        404: SESSION_EXTEND_FAILED_MESSAGE,
      },
      { notifySession: false },
    );
  }

  const body = (await response.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const accessToken = readTokenField(body?.accessToken);
  const nextRefreshToken = readTokenField(body?.refreshToken);

  if (!accessToken) {
    throw new ApiError(200, SESSION_EXTEND_FAILED_MESSAGE);
  }

  // 응답을 기다리는 사이 로그아웃했거나 다른 계정으로 로그인했으면 받은 토큰을 저장하지 않는다.
  // 저장하면 로그아웃이 풀리거나 다른 계정의 세션을 덮어쓴다.
  if (getRefreshToken() !== refreshToken) {
    throw new ApiError(401, SESSION_EXTEND_FAILED_MESSAGE);
  }

  setAuthTokens({ accessToken, refreshToken: nextRefreshToken });

  return accessToken;
}

/**
 * 리프레시 토큰으로 새 액세스 토큰을 받아 저장하고 돌려준다.
 * 리프레시 토큰은 한 번 쓰면 폐기(회전)되므로, 동시에 여러 번 불려도 요청은 하나만 보낸다.
 */
export function reissueAuthToken(): Promise<string> {
  pendingReissue ??= performReissue().finally(() => {
    pendingReissue = null;
  });

  return pendingReissue;
}

function getTokenSubject(token: string): string | null {
  const subject = decodeJwtPayload(token)?.sub;

  return typeof subject === "string" && subject ? subject : null;
}

/** 두 토큰이 같은 계정의 것인지. 계정을 읽을 수 없으면 다른 계정으로 본다. */
function isSameAccountToken(left: string, right: string): boolean {
  const subject = getTokenSubject(left);

  return subject !== null && subject === getTokenSubject(right);
}

async function isExpiredTokenResponse(response: Response): Promise<boolean> {
  if (response.status !== 401) {
    return false;
  }

  const body = await parseErrorBody(response.clone());

  return body.code === EXPIRED_TOKEN_CODE;
}

/**
 * 서버에서 액세스 토큰이 만료돼 401 이 오면(시계 차이 등) 한 번만 새 토큰으로 다시 보낸다.
 * 다른 탭이 같은 계정으로 이미 새 토큰을 저장했으면 그것을 쓰고, 아니면 재발급한다.
 * 그 사이 로그아웃했거나 다른 계정으로 바뀌었으면 다시 보내지 않는다(다른 계정 권한으로 요청이 나가지 않게).
 * 재발급할 수 없으면 처음 응답을 그대로 돌려줘 평소처럼 세션 종료로 처리된다.
 */
async function sendWithTokenRetry(
  token: string | null | undefined,
  send: (token: string | null | undefined) => Promise<Response>,
): Promise<{ response: Response; token: string | null | undefined }> {
  const response = await send(token);

  if (!token || !(await isExpiredTokenResponse(response))) {
    return { response, token };
  }

  const storedToken = getAuthToken();

  if (storedToken !== token) {
    return storedToken && isSameAccountToken(storedToken, token)
      ? { response: await send(storedToken), token: storedToken }
      : { response, token };
  }

  let reissuedToken: string;

  try {
    reissuedToken = await reissueAuthToken();
  } catch {
    return { response, token };
  }

  return isSameAccountToken(reissuedToken, token)
    ? { response: await send(reissuedToken), token: reissuedToken }
    : { response, token };
}

/**
 * 실패한 요청이 지금 세션의 것인지. 로그아웃 뒤 다른 계정으로 로그인한 상태에서
 * 이전 계정의 요청이 401 을 받아도 지금 세션을 끝내지 않는다.
 */
function isCurrentSessionRequest(token: string | null | undefined): boolean {
  const storedToken = getAuthToken();

  return !token || !storedToken || storedToken === token;
}

export async function request<TResponse>(
  path: string,
  {
    method = "GET",
    body,
    token,
    signal,
    errorMessages = {},
  }: RequestOptions = {},
): Promise<TResponse | undefined> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  let result: Awaited<ReturnType<typeof sendWithTokenRetry>>;

  try {
    result = await sendWithTokenRetry(token, (requestToken) =>
      fetch(`${getApiBaseUrl()}${path}`, {
        method,
        headers: requestToken
          ? { ...headers, Authorization: `Bearer ${requestToken}` }
          : headers,
        body:
          body === undefined
            ? undefined
            : isFormData
              ? (body as FormData)
              : JSON.stringify(body),
        signal,
      }),
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(0, NETWORK_ERROR_MESSAGE);
  }

  const { response } = result;

  if (!response.ok) {
    await throwErrorResponse(response, errorMessages, {
      notifySession: isCurrentSessionRequest(result.token),
    });
  }

  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as TResponse;
  } catch {
    // 본문이 JSON이 아닌 성공 응답(예: DELETE 200 "삭제완료")은 본문 없음으로 취급한다.
    return undefined;
  }
}

export interface BlobRequestOptions {
  /** 미리보기처럼 본문을 보내 PDF 를 받는 요청은 POST 로 부른다. */
  method?: "GET" | "POST";
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
  errorMessages?: ErrorMessageMap;
}

export async function requestBlob(
  path: string,
  {
    method = "GET",
    body,
    token,
    signal,
    errorMessages = {},
  }: BlobRequestOptions = {},
): Promise<Blob> {
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let result: Awaited<ReturnType<typeof sendWithTokenRetry>>;

  try {
    result = await sendWithTokenRetry(token, (requestToken) =>
      fetch(`${getApiBaseUrl()}${path}`, {
        method,
        headers: requestToken
          ? { ...headers, Authorization: `Bearer ${requestToken}` }
          : headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
      }),
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(0, NETWORK_ERROR_MESSAGE);
  }

  const { response } = result;

  if (!response.ok) {
    await throwErrorResponse(response, errorMessages, {
      notifySession: isCurrentSessionRequest(result.token),
    });
  }

  return response.blob();
}
