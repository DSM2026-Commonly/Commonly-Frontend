import {
  clearRememberedLoginId,
  getRememberedLoginId,
  getSafeRedirectPath,
  login,
  setAuthTokens,
  setRememberedLoginId,
} from "@commonly/utils";
import { useLocation, useNavigate } from "react-router";
import Login, { type LoginFormData, type LoginVariant } from "../login/Login";

export interface LoginPageProps {
  variant?: LoginVariant;
  /** civil 변형에서 회원가입 페이지 경로. 지정하면 SPA 라우팅으로 이동한다. */
  signupHref?: string;
}

/** 세 앱이 공유하는 로그인 페이지. 로그인 API 호출과 토큰 저장을 담당한다. */
function LoginPage({ variant, signupHref }: LoginPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const redirectPath = getSafeRedirectPath(
    new URLSearchParams(location.search).get("redirectTo"),
  );

  const handleLogin = async (formData: LoginFormData) => {
    const tokens = await login({
      accountId: formData.loginId,
      password: formData.password,
    });

    const didStoreTokens = setAuthTokens(tokens);

    if (!didStoreTokens) {
      throw new Error(
        "브라우저 저장소를 사용할 수 없어 로그인할 수 없습니다.",
      );
    }

    if (formData.rememberLoginId) {
      setRememberedLoginId(formData.loginId);
    } else {
      clearRememberedLoginId();
    }

    void navigate(redirectPath, { replace: true });
  };

  return (
    <Login
      initialLoginId={getRememberedLoginId()}
      onSubmit={handleLogin}
      signupHref={signupHref}
      onNavigateSignup={
        signupHref ? () => void navigate(signupHref) : undefined
      }
      variant={variant}
    />
  );
}

export default LoginPage;
