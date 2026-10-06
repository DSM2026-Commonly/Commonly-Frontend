import { afterEach, describe, expect, test } from "bun:test";
import {
  REGISTRATION_SESSION_STORAGE_KEY,
  clearRegistrationSession,
  getRegistrationSession,
  updateRegistrationSession,
} from "../registrationSession";

const globalWithWindow = globalThis as unknown as { window?: unknown };
const originalWindow = globalWithWindow.window;

function installStorage(options: { failSet?: boolean; throwOnAccess?: boolean } = {}) {
  const data = new Map<string, string>();
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (options.failSet) {
        throw new Error("QuotaExceededError");
      }
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };

  globalWithWindow.window = options.throwOnAccess
    ? Object.defineProperty({}, "sessionStorage", {
        get() {
          // 사생활 보호 모드 등에서 접근 자체가 막히는 경우
          throw new Error("SecurityError");
        },
      })
    : { sessionStorage: storage };

  return data;
}

afterEach(() => {
  globalWithWindow.window = originalWindow;
});

describe("registrationSession", () => {
  test("returns an empty session when nothing is stored", () => {
    installStorage();
    expect(getRegistrationSession()).toEqual({});
  });

  test("merges patches instead of overwriting earlier steps", () => {
    const data = installStorage();

    expect(updateRegistrationSession({ noticeAgreed: true })).toBe(true);
    expect(
      updateRegistrationSession({
        uploadedFile: { fileId: 1, fileName: "a.xlsx" } as never,
      }),
    ).toBe(true);

    expect(getRegistrationSession()).toEqual({
      noticeAgreed: true,
      uploadedFile: { fileId: 1, fileName: "a.xlsx" },
    });
    expect(data.has(REGISTRATION_SESSION_STORAGE_KEY)).toBe(true);
  });

  test("clear removes the whole session", () => {
    installStorage();
    updateRegistrationSession({ noticeAgreed: true });

    clearRegistrationSession();

    expect(getRegistrationSession()).toEqual({});
  });

  test.each([
    ["broken JSON", "{not json"],
    ["a non-object value", "123"],
    ["null", "null"],
  ])("treats %s as an empty session", (_label, raw) => {
    const data = installStorage();
    data.set(REGISTRATION_SESSION_STORAGE_KEY, raw);

    expect(getRegistrationSession()).toEqual({});
  });

  test("reports failure when the browser refuses to save (quota)", () => {
    installStorage({ failSet: true });

    expect(updateRegistrationSession({ noticeAgreed: true })).toBe(false);
  });

  test("reports failure when storage access itself throws", () => {
    installStorage({ throwOnAccess: true });

    expect(updateRegistrationSession({ noticeAgreed: true })).toBe(false);
    expect(getRegistrationSession()).toEqual({});
    expect(() => clearRegistrationSession()).not.toThrow();
  });

  test("works as a no-op outside the browser", () => {
    globalWithWindow.window = undefined;

    expect(updateRegistrationSession({ noticeAgreed: true })).toBe(false);
    expect(getRegistrationSession()).toEqual({});
  });
});
