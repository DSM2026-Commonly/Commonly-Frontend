import { UNAUTHORIZED_EVENT, clearAuthToken } from "@commonly/utils";
import { useEffect } from "react";
import useAuthSession from "./useAuthSession";

/**
 * 세션이 끝났을 때(토큰 만료 시각 도달 또는 API 401 응답) 토큰을 지우고 로그인 화면으로 보낸다.
 * 인증이 필요한 레이아웃에서 사용한다.
 */
function useSessionGuard(redirectToLogin: () => void): void {
  const { isExpired } = useAuthSession();

  useEffect(() => {
    const expire = () => {
      clearAuthToken();
      redirectToLogin();
    };

    if (isExpired) {
      expire();
      return;
    }

    window.addEventListener(UNAUTHORIZED_EVENT, expire);

    return () => window.removeEventListener(UNAUTHORIZED_EVENT, expire);
  }, [isExpired, redirectToLogin]);
}

export default useSessionGuard;
