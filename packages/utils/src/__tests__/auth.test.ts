import { describe, expect, test } from "bun:test";
import {
  AUTH_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  clearAuthToken,
  setAuthTokens,
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

const tokens = { accessToken: "access", refreshToken: "refresh" };

describe("setAuthTokens", () => {
  test("stores both tokens and returns true", () => {
    const { storage, data } = createStorage();

    expect(setAuthTokens(tokens, storage)).toBe(true);
    expect(data.get(AUTH_TOKEN_STORAGE_KEY)).toBe("access");
    expect(data.get(REFRESH_TOKEN_STORAGE_KEY)).toBe("refresh");
  });

  test("returns false and removes access token when refresh token storage fails", () => {
    const { storage, data } = createStorage({
      failSetKeys: [REFRESH_TOKEN_STORAGE_KEY],
    });

    expect(setAuthTokens(tokens, storage)).toBe(false);
    expect(data.has(AUTH_TOKEN_STORAGE_KEY)).toBe(false);
    expect(data.has(REFRESH_TOKEN_STORAGE_KEY)).toBe(false);
  });

  test("returns false when access token storage fails", () => {
    const { storage, data } = createStorage({
      failSetKeys: [AUTH_TOKEN_STORAGE_KEY],
    });

    expect(setAuthTokens(tokens, storage)).toBe(false);
    expect(data.has(REFRESH_TOKEN_STORAGE_KEY)).toBe(false);
  });
});

describe("clearAuthToken", () => {
  test("removes both tokens and returns true", () => {
    const { storage, data } = createStorage();
    setAuthTokens(tokens, storage);

    expect(clearAuthToken(storage)).toBe(true);
    expect(data.size).toBe(0);
  });

  test("returns false when refresh token removal fails", () => {
    const { storage, data } = createStorage({
      failRemoveKeys: [REFRESH_TOKEN_STORAGE_KEY],
    });
    setAuthTokens(tokens, storage);

    expect(clearAuthToken(storage)).toBe(false);
    expect(data.has(AUTH_TOKEN_STORAGE_KEY)).toBe(false);
  });

  test("returns false when access token removal fails", () => {
    const { storage } = createStorage({
      failRemoveKeys: [AUTH_TOKEN_STORAGE_KEY],
    });
    setAuthTokens(tokens, storage);

    expect(clearAuthToken(storage)).toBe(false);
  });
});
