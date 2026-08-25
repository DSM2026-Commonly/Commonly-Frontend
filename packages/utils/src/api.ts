const DEFAULT_API_BASE_URL = "";

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  return (configured || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const NETWORK_ERROR_MESSAGE =
  "서버에 연결할 수 없습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.";
export const SERVER_ERROR_MESSAGE =
  "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
  errorMessages?: Partial<Record<number, string>>;
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
): Promise<TResponse> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (body !== undefined) {
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
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(0, NETWORK_ERROR_MESSAGE);
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      errorMessages[response.status] ?? SERVER_ERROR_MESSAGE,
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}
