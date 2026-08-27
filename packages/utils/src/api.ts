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
  const message =
    (errorBody.code ? errorMessages[errorBody.code] : undefined) ??
    errorMessages[response.status] ??
    SERVER_ERROR_MESSAGE;

  throw new ApiError(response.status, message, errorBody);
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
