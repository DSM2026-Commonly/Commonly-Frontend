/**
 * 방금 발급한 증명서를 가리키는 최소 정보.
 * 완료 화면에서 새로고침하거나 뒤로 갔다 돌아와도 다시 내려받을 수 있도록
 * sessionStorage 에 보관한다. 표시할 값은 저장하지 않고 발급 상세를 다시 조회한다.
 */
export const ISSUED_CERTIFICATE_SESSION_STORAGE_KEY = "issuedCertificate";

/** 전체 발급/선택 발급. 완료 화면 문구에만 쓰여 서버 응답으로는 복구할 수 없다. */
export type IssuedCertificateIssueType = "all" | "selected";

export interface IssuedCertificateSession {
  certificateId: number;
  issueType: IssuedCertificateIssueType;
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

export function getIssuedCertificateSession(): IssuedCertificateSession | null {
  try {
    const raw = resolveStorage()?.getItem(
      ISSUED_CERTIFICATE_SESSION_STORAGE_KEY,
    );

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const { certificateId, issueType } = parsed as Record<string, unknown>;

    if (typeof certificateId !== "number" || !Number.isFinite(certificateId)) {
      return null;
    }

    return {
      certificateId,
      issueType: issueType === "selected" ? "selected" : "all",
    };
  } catch {
    return null;
  }
}

/** 저장에 실패해도 발급 자체는 성공한 상태이므로 성공 여부만 돌려준다. */
export function setIssuedCertificateSession(
  session: IssuedCertificateSession,
): boolean {
  const storage = resolveStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(
      ISSUED_CERTIFICATE_SESSION_STORAGE_KEY,
      JSON.stringify(session),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearIssuedCertificateSession(): void {
  try {
    resolveStorage()?.removeItem(ISSUED_CERTIFICATE_SESSION_STORAGE_KEY);
  } catch {
    // 저장소를 사용할 수 없으면 무시한다.
  }
}
