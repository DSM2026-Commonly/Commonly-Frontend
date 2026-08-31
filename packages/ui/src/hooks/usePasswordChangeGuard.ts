import { PASSWORD_CHANGE_REQUIRED_EVENT } from "@commonly/utils";
import { useEffect } from "react";

/**
 * 초기 비밀번호를 아직 바꾸지 않은 직원 계정이 다른 API 를 호출해 403 을 받으면
 * 비밀번호 변경 화면으로 보낸다. 인증이 필요한 레이아웃에서 사용한다.
 */
function usePasswordChangeGuard(redirectToPasswordChange: () => void): void {
  useEffect(() => {
    window.addEventListener(
      PASSWORD_CHANGE_REQUIRED_EVENT,
      redirectToPasswordChange,
    );

    return () =>
      window.removeEventListener(
        PASSWORD_CHANGE_REQUIRED_EVENT,
        redirectToPasswordChange,
      );
  }, [redirectToPasswordChange]);
}

export default usePasswordChangeGuard;
