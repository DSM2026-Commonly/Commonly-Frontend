import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  ISSUED_CERTIFICATE_SESSION_STORAGE_KEY,
  clearIssuedCertificateSession,
  getIssuedCertificateSession,
  setIssuedCertificateSession,
} from "../issuedCertificateSession";

function createStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    get size() {
      return store.size;
    },
  };
}

function useStorage(storage: ReturnType<typeof createStorage>) {
  (globalThis as { window?: unknown }).window = { sessionStorage: storage };
}

describe("issuedCertificateSession", () => {
  const originalWindow = (globalThis as { window?: unknown }).window;

  beforeEach(() => {
    useStorage(createStorage());
  });

  // 가짜 window 가 다른 테스트 파일로 새지 않게 되돌린다.
  afterEach(() => {
    (globalThis as { window?: unknown }).window = originalWindow;
  });

  test("stores and reads back the issued certificate", () => {
    expect(
      setIssuedCertificateSession({ certificateId: 5, issueType: "selected" }),
    ).toBe(true);

    expect(getIssuedCertificateSession()).toEqual({
      certificateId: 5,
      issueType: "selected",
    });
  });

  test("returns null when nothing is stored", () => {
    expect(getIssuedCertificateSession()).toBeNull();
  });

  test("ignores an entry without a numeric certificateId", () => {
    useStorage(
      createStorage({
        [ISSUED_CERTIFICATE_SESSION_STORAGE_KEY]: JSON.stringify({
          certificateId: "5",
          issueType: "all",
        }),
      }),
    );

    expect(getIssuedCertificateSession()).toBeNull();
  });

  test("falls back to 전체 발급 for an unknown issue type", () => {
    useStorage(
      createStorage({
        [ISSUED_CERTIFICATE_SESSION_STORAGE_KEY]: JSON.stringify({
          certificateId: 5,
          issueType: "unknown",
        }),
      }),
    );

    expect(getIssuedCertificateSession()?.issueType).toBe("all");
  });

  test("ignores malformed JSON", () => {
    useStorage(
      createStorage({ [ISSUED_CERTIFICATE_SESSION_STORAGE_KEY]: "{" }),
    );

    expect(getIssuedCertificateSession()).toBeNull();
  });

  test("clears the stored certificate", () => {
    const storage = createStorage();
    useStorage(storage);

    setIssuedCertificateSession({ certificateId: 5, issueType: "all" });
    clearIssuedCertificateSession();

    expect(storage.size).toBe(0);
    expect(getIssuedCertificateSession()).toBeNull();
  });

  test("reports failure when storage is unavailable", () => {
    (globalThis as { window?: unknown }).window = {
      get sessionStorage(): never {
        throw new Error("blocked");
      },
    };

    expect(
      setIssuedCertificateSession({ certificateId: 5, issueType: "all" }),
    ).toBe(false);
    expect(getIssuedCertificateSession()).toBeNull();
  });
});
