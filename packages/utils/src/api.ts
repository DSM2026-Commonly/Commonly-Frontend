const DEFAULT_API_BASE_URL = "";

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  return (configured || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

export interface ApiErrorBody {
  code?: string;
  message?: string;
  detail?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly detail?: unknown;

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = body?.code;
    this.detail = body?.detail;
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

function notifyUnauthorized(): void {
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
  // 매핑된 문구가 없으면 백엔드가 내려준 message 를 그대로 보여준다.
  const message =
    (errorBody.code ? errorMessages[errorBody.code] : undefined) ??
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

    const { code, message, detail } = body as Record<string, unknown>;

    return {
      code: typeof code === "string" ? code : undefined,
      message: typeof message === "string" ? message : undefined,
      detail,
    };
  } catch {
    return {};
  }
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
