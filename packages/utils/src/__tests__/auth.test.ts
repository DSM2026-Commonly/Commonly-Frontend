import { describe, expect, test } from "bun:test";
import {
  AUTH_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  clearAuthToken,
  setAuthToken,
  type AuthStorage,
} from "../auth";

function createStorage(
  options: { failSetKeys?: string[]; failRemoveKeys?: string[] } = {},
) {
  const data = new Map<string, string>();
  const storage: AuthStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      if (options.failSetKeys?.includes(key)) {
        throw new Error(`setItem failed: ${key}`);
      }
      data.set(key, value);
    },
    removeItem: (key) => {
      if (options.failRemoveKeys?.includes(key)) {
        throw new Error(`removeItem failed: ${key}`);
      }
      data.delete(key);
    },
  };
  return { storage, data };
}

describe("setAuthToken", () => {
  test("stores the trimmed access token and returns true", () => {
    const { storage, data } = createStorage();

    expect(setAuthToken("  access  ", storage)).toBe(true);
    expect(data.get(AUTH_TOKEN_STORAGE_KEY)).toBe("access");
  });

  test("returns false when storage fails", () => {
    const { storage, data } = createStorage({
      failSetKeys: [AUTH_TOKEN_STORAGE_KEY],
    });

    expect(setAuthToken("access", storage)).toBe(false);
    expect(data.has(AUTH_TOKEN_STORAGE_KEY)).toBe(false);
  });

  test("removes the stored token and returns false for a blank token", () => {
    const { storage, data } = createStorage();
    setAuthToken("access", storage);

    expect(setAuthToken("   ", storage)).toBe(false);
    expect(data.has(AUTH_TOKEN_STORAGE_KEY)).toBe(false);
  });
});

describe("clearAuthToken", () => {
  test("removes the access token and any legacy refresh token", () => {
    const { storage, data } = createStorage();
    setAuthToken("access", storage);
    data.set(REFRESH_TOKEN_STORAGE_KEY, "legacy-refresh");

    expect(clearAuthToken(storage)).toBe(true);
    expect(data.size).toBe(0);
  });

  test("legacy refresh cleanup is best-effort and does not fail the logout", () => {
    const { storage, data } = createStorage({
      failRemoveKeys: [REFRESH_TOKEN_STORAGE_KEY],
    });
    setAuthToken("access", storage);

    expect(clearAuthToken(storage)).toBe(true);
    expect(data.has(AUTH_TOKEN_STORAGE_KEY)).toBe(false);
  });

  test("returns false when access token removal fails", () => {
    const { storage } = createStorage({
      failRemoveKeys: [AUTH_TOKEN_STORAGE_KEY],
    });
    setAuthToken("access", storage);

    expect(clearAuthToken(storage)).toBe(false);
  });
});
