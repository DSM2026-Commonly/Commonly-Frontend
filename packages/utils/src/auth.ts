export const AUTH_TOKEN_STORAGE_KEY = "token";
export const REMEMBERED_LOGIN_ID_STORAGE_KEY = "rememberedLoginId";

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
    return false;
  }

  return writeStorageValue(
    AUTH_TOKEN_STORAGE_KEY,
    normalizedToken,
    storage,
  );
}

export function clearAuthToken(storage?: AuthStorage): boolean {
  return removeStorageValue(AUTH_TOKEN_STORAGE_KEY, storage);
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

export function createLocalSessionToken(): string {
  const randomId = globalThis.crypto?.randomUUID?.();
  return `local-session:${randomId ?? `${Date.now()}-${Math.random()}`}`;
}
