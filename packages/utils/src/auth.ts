export const AUTH_TOKEN_STORAGE_KEY = "token";
export const REFRESH_TOKEN_STORAGE_KEY = "refreshToken";
export const REMEMBERED_LOGIN_ID_STORAGE_KEY = "rememberedLoginId";
/**
 * 같은 탭에서 토큰을 저장·삭제했을 때 window 에 발행되는 이벤트 이름.
 * storage 이벤트는 다른 탭에만 가므로, 세션 연장 직후 남은 시간을 다시 읽으려면 따로 알려야 한다.
 */
export const AUTH_TOKEN_CHANGED_EVENT = "commonly:auth-token-changed";

export interface AuthStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function resolveStorage(storage?: AuthStorage): AuthStorage | null {
  if (storage) {
    return storage;
  }

  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readStorageValue(
  key: string,
  storage?: AuthStorage,
): string | null {
  try {
    return resolveStorage(storage)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeStorageValue(
  key: string,
  value: string,
  storage?: AuthStorage,
): boolean {
  const targetStorage = resolveStorage(storage);

  if (!targetStorage) {
    return false;
  }

  try {
    targetStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function removeStorageValue(key: string, storage?: AuthStorage): boolean {
  const targetStorage = resolveStorage(storage);

  if (!targetStorage) {
    return false;
  }

  try {
    targetStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// 직접 넘긴 저장소(테스트 등)는 브라우저 탭과 무관하므로 알리지 않는다.
function notifyAuthTokenChanged(storage?: AuthStorage): void {
  if (
    storage ||
    typeof window === "undefined" ||
    typeof CustomEvent === "undefined"
  ) {
    return;
  }

  window.dispatchEvent(new CustomEvent(AUTH_TOKEN_CHANGED_EVENT));
}

export function getAuthToken(storage?: AuthStorage): string | null {
  const token = readStorageValue(AUTH_TOKEN_STORAGE_KEY, storage)?.trim();
  return token || null;
}

export function hasAuthToken(storage?: AuthStorage): boolean {
  return getAuthToken(storage) !== null;
}

export function setAuthToken(token: string, storage?: AuthStorage): boolean {
  const normalizedToken = token.trim();

  if (!normalizedToken) {
    removeStorageValue(AUTH_TOKEN_STORAGE_KEY, storage);
    notifyAuthTokenChanged(storage);
    return false;
  }

  const didStore = writeStorageValue(
    AUTH_TOKEN_STORAGE_KEY,
    normalizedToken,
    storage,
  );

  notifyAuthTokenChanged(storage);

  return didStore;
}

export function getRefreshToken(storage?: AuthStorage): string | null {
  const token = readStorageValue(REFRESH_TOKEN_STORAGE_KEY, storage)?.trim();
  return token || null;
}

export interface AuthTokens {
  accessToken: string;
  /** 재발급용 토큰. 예전 배포본처럼 오지 않으면 null 이고, 남아 있던 값은 지운다. */
  refreshToken: string | null;
}

/**
 * 로그인·회원가입·재발급으로 받은 토큰 한 쌍을 저장한다.
 * 리프레시 토큰은 재발급할 때마다 바뀌므로(회전) 항상 새 값으로 바꿔 둔다.
 * 액세스 토큰을 저장하지 못하면 false 다. 리프레시 토큰 저장 실패는 연장만 못 할 뿐이라 막지 않는다.
 */
export function setAuthTokens(
  { accessToken, refreshToken }: AuthTokens,
  storage?: AuthStorage,
): boolean {
  const normalizedRefreshToken = refreshToken?.trim();

  if (normalizedRefreshToken) {
    writeStorageValue(
      REFRESH_TOKEN_STORAGE_KEY,
      normalizedRefreshToken,
      storage,
    );
  } else {
    removeStorageValue(REFRESH_TOKEN_STORAGE_KEY, storage);
  }

  return setAuthToken(accessToken, storage);
}

/**
 * 재발급에 실패한 리프레시 토큰을 지운다. 다른 탭이 그 사이 새 토큰으로 바꿔 뒀다면 그대로 둔다.
 */
export function clearRefreshToken(expected: string, storage?: AuthStorage): void {
  if (getRefreshToken(storage) === expected) {
    removeStorageValue(REFRESH_TOKEN_STORAGE_KEY, storage);
  }
}

export function clearAuthToken(storage?: AuthStorage): boolean {
  // 리프레시 토큰 삭제는 best-effort 다. 실패해도 액세스 토큰만 지우면 로그아웃된다.
  removeStorageValue(REFRESH_TOKEN_STORAGE_KEY, storage);

  const didClear = removeStorageValue(AUTH_TOKEN_STORAGE_KEY, storage);

  notifyAuthTokenChanged(storage);

  return didClear;
}

export function getRememberedLoginId(storage?: AuthStorage): string {
  return (
    readStorageValue(REMEMBERED_LOGIN_ID_STORAGE_KEY, storage)?.trim() ?? ""
  );
}

export function setRememberedLoginId(
  loginId: string,
  storage?: AuthStorage,
): boolean {
  const normalizedLoginId = loginId.trim();

  if (!normalizedLoginId) {
    return clearRememberedLoginId(storage);
  }

  return writeStorageValue(
    REMEMBERED_LOGIN_ID_STORAGE_KEY,
    normalizedLoginId,
    storage,
  );
}

export function clearRememberedLoginId(storage?: AuthStorage): boolean {
  return removeStorageValue(REMEMBERED_LOGIN_ID_STORAGE_KEY, storage);
}

function containsControlCharacter(value: string): boolean {
  return Array.from(value).some((character) => {
    const characterCode = character.charCodeAt(0);
    return characterCode <= 31 || characterCode === 127;
  });
}

export function getSafeRedirectPath(
  candidate: string | null | undefined,
  fallback = "/",
): string {
  const normalizedCandidate = candidate?.trim();

  if (
    !normalizedCandidate ||
    !normalizedCandidate.startsWith("/") ||
    normalizedCandidate.startsWith("//") ||
    normalizedCandidate.includes("\\") ||
    containsControlCharacter(normalizedCandidate)
  ) {
    return fallback;
  }

  try {
    const baseUrl = new URL("https://commonly.local");
    const redirectUrl = new URL(normalizedCandidate, baseUrl);

    if (
      redirectUrl.origin !== baseUrl.origin ||
      redirectUrl.pathname === "/login"
    ) {
      return fallback;
    }

    return `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`;
  } catch {
    return fallback;
  }
}
