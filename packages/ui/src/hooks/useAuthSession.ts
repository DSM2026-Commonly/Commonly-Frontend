import {
  AUTH_TOKEN_STORAGE_KEY,
  formatRemainingSessionTime,
  getAuthSession,
  type AuthSession,
} from "@commonly/utils";
import { useEffect, useState } from "react";

export interface AuthSessionState {
  session: AuthSession | null;
  /** "MM분 SS초" 형식의 남은 세션 시간. 1초마다 갱신된다. */
  remainingTime: string;
  isExpired: boolean;
}

/**
 * 저장된 액세스 토큰에서 로그인 사용자와 세션 만료 시각을 읽어 1초 단위로 남은 시간을 계산한다.
 * 다른 탭에서 토큰이 바뀌면 storage 이벤트로 다시 읽는다.
 */
function useAuthSession(): AuthSessionState {
  const [session, setSession] = useState<AuthSession | null>(getAuthSession);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === AUTH_TOKEN_STORAGE_KEY) {
        setSession(getAuthSession());
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const expiresAt = session?.expiresAt ?? null;

  useEffect(() => {
    if (expiresAt === null) {
      return;
    }

    setNow(Date.now());
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(intervalId);
  }, [expiresAt]);

  return {
    session,
    remainingTime: formatRemainingSessionTime(expiresAt, now),
    isExpired: expiresAt !== null && expiresAt <= now,
  };
}

export default useAuthSession;
