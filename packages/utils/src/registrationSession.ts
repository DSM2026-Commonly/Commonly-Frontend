import type { FileMapping, FileMappingResult, UploadedFile } from "./files";

/**
 * 통합 등록 흐름(업로드 → 매핑 → 완료)에서 페이지 간에 공유되는 상태.
 * 새로고침에도 유지되도록 sessionStorage 에 보관한다.
 */
export const REGISTRATION_SESSION_STORAGE_KEY = "integratedRegistration";

export interface IntegratedRegistrationSession {
  uploadedFile?: UploadedFile;
  mappings?: FileMapping[];
  result?: FileMappingResult;
}

interface SessionStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function resolveStorage(): SessionStorageLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function getRegistrationSession(): IntegratedRegistrationSession {
  try {
    const raw = resolveStorage()?.getItem(REGISTRATION_SESSION_STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);

    return parsed && typeof parsed === "object"
      ? (parsed as IntegratedRegistrationSession)
      : {};
  } catch {
    return {};
  }
}

export function updateRegistrationSession(
  patch: Partial<IntegratedRegistrationSession>,
): boolean {
  const storage = resolveStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(
      REGISTRATION_SESSION_STORAGE_KEY,
      JSON.stringify({ ...getRegistrationSession(), ...patch }),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearRegistrationSession(): void {
  try {
    resolveStorage()?.removeItem(REGISTRATION_SESSION_STORAGE_KEY);
  } catch {
    // 저장소를 사용할 수 없으면 무시한다.
  }
}
