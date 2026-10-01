import { hasValidAuthToken } from "./authSession";

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
/** 백엔드 InitialPasswordFilter 가 내려주는 메시지. 에러 코드가 없어 이 문구로 구분한다. */
export const INITIAL_PASSWORD_NOT_CHANGED_MESSAGE =
  "초기 비밀번호를 변경한 후 이용할 수 있습니다.";

function dispatchWindowEvent(name: string): void {
  if (typeof window === "undefined" || typeof CustomEvent === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(name));
}

/**
 * 백엔드는 권한이 없는 요청에도 403 이 아니라 401 을 준다(민원인 토큰으로 담당자용 API 호출 등).
 * 저장된 토큰이 아직 유효하면 세션 만료가 아니므로 로그아웃시키지 않는다.
 * 그렇지 않으면 권한 밖 API 한 번에 로그인 화면으로 튕기고, 로그인 → 같은 API 재호출 → 401 로
 * 다시 튕기는 루프에 갇힌다.
 */
function notifyUnauthorized(): void {
  if (hasValidAuthToken()) {
    return;
  }

  dispatchWindowEvent(UNAUTHORIZED_EVENT);
}

export function isInitialPasswordNotChangedError(
  status: number,
  body: ApiErrorBody,
): boolean {
  return (
    status === 403 &&
    (body.message?.trim() ?? "") === INITIAL_PASSWORD_NOT_CHANGED_MESSAGE
  );
}

/**
 * 목록 응답을 `{content, totalCount, <totalPagesKey>}` 로 정규화한다.
 * 백엔드가 배열만 내려주는 경우(현재 /api/admins, /api/issuance-histories)도 받는다.
 */
export function normalizePageEnvelope(
  response: unknown,
  invalidMessage: string,
  totalPagesKey: "totalPages" | "totalPage" = "totalPages",
): { content: unknown[]; totalCount: unknown; totalPages: unknown; totalPage: unknown } {
  if (Array.isArray(response)) {
    return {
      content: response,
      totalCount: undefined,
      totalPages: undefined,
      totalPage: undefined,
    };
  }

  if (!response || typeof response !== "object") {
    throw new ApiError(200, invalidMessage);
  }

  const record = response as Record<string, unknown>;

  if (!Array.isArray(record.content)) {
    throw new ApiError(200, invalidMessage);
  }

  return {
    content: record.content,
    totalCount: record.totalCount,
    totalPages: record[totalPagesKey],
    totalPage: record[totalPagesKey],
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
): Promise<never> {
  const errorBody = await parseErrorBody(response);
  // 백엔드 에러 본문은 {status, timestamp, message} 형식이라 code 는 오지 않는다.
  // 검증 실패만 {status, timestamp, error: {필드: 문구}} 로 message 없이 온다. 이때는
  // 상태코드 매핑("입력값이 올바르지 않습니다")보다 어느 칸이 왜 틀렸는지 짚어주는
  // 백엔드 문구가 정확하므로 먼저 쓴다.
  const message =
    (errorBody.code ? errorMessages[errorBody.code] : undefined) ??
    formatFieldErrors(errorBody.fieldErrors) ??
    errorMessages[response.status] ??
    (errorBody.message?.trim() || undefined) ??
    SERVER_ERROR_MESSAGE;

  if (response.status === 401) {
    notifyUnauthorized();
  } else if (isInitialPasswordNotChangedError(response.status, errorBody)) {
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

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(0, NETWORK_ERROR_MESSAGE);
  }

  if (!response.ok) {
    await throwErrorResponse(response, errorMessages);
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
  token?: string | null;
  signal?: AbortSignal;
  errorMessages?: ErrorMessageMap;
}

export async function requestBlob(
  path: string,
  { token, signal, errorMessages = {} }: BlobRequestOptions = {},
): Promise<Blob> {
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, { headers, signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(0, NETWORK_ERROR_MESSAGE);
  }

  if (!response.ok) {
    await throwErrorResponse(response, errorMessages);
  }

  return response.blob();
}
