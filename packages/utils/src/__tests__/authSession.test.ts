import { describe, expect, test } from "bun:test";
import { AUTH_TOKEN_STORAGE_KEY, type AuthStorage } from "../auth";
import {
  decodeJwtPayload,
  formatRemainingSessionTime,
  getAuthSession,
} from "../authSession";

function encodeSegment(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function createToken(payload: Record<string, unknown>): string {
  return `${encodeSegment({ alg: "HS256", typ: "JWT" })}.${encodeSegment(payload)}.signature`;
}

function createStorage(token: string | null): AuthStorage {
  const data = new Map<string, string>();

  if (token !== null) {
    data.set(AUTH_TOKEN_STORAGE_KEY, token);
  }

  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

describe("decodeJwtPayload", () => {
  test("decodes base64url payload including non-ASCII names", () => {
    const token = createToken({ sub: "user01", name: "홍길동", exp: 1 });

    expect(decodeJwtPayload(token)).toEqual({
      sub: "user01",
      name: "홍길동",
      exp: 1,
    });
  });

  test("returns null for malformed tokens", () => {
    expect(decodeJwtPayload("not-a-jwt")).toBeNull();
    expect(decodeJwtPayload("a.!!!.c")).toBeNull();
    expect(decodeJwtPayload(`a.${encodeSegment("string")}.c`)).toBeNull();
  });
});

describe("getAuthSession", () => {
  test("reads name, account id and expiry from the stored token", () => {
    const storage = createStorage(
      createToken({ sub: "user01", name: "홍길동", exp: 1_700_000_000 }),
    );

    expect(getAuthSession(storage)).toEqual({
      name: "홍길동",
      accountId: "user01",
      expiresAt: 1_700_000_000_000,
    });
  });

  test("falls back to the account id when no name claim exists", () => {
    const storage = createStorage(createToken({ accountId: "staff77" }));

    expect(getAuthSession(storage)).toEqual({
      name: "staff77",
      accountId: "staff77",
      expiresAt: null,
    });
  });

  test("returns null without a token or with an undecodable token", () => {
    expect(getAuthSession(createStorage(null))).toBeNull();
    expect(getAuthSession(createStorage("opaque-token"))).toBeNull();
  });
});

describe("formatRemainingSessionTime", () => {
  test("formats minutes and seconds with zero padding", () => {
    const now = 1_000_000;

    expect(formatRemainingSessionTime(now + 5 * 60_000 + 7_000, now)).toBe(
      "05분 07초",
    );
    expect(formatRemainingSessionTime(now + 125 * 60_000, now)).toBe(
      "125분 00초",
    );
  });

  test("clamps expired or unknown expiry to zero", () => {
    expect(formatRemainingSessionTime(500, 1_000)).toBe("00분 00초");
    expect(formatRemainingSessionTime(null)).toBe("00분 00초");
  });
});
