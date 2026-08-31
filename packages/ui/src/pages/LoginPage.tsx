import {
  clearRememberedLoginId,
  getRememberedLoginId,
  getSafeRedirectPath,
  login,
  requiresInitialPasswordChange,
  setAuthToken,
  setRememberedLoginId,
} from "@commonly/utils";
import { useLocation, useNavigate } from "react-router";
import Login, { type LoginFormData, type LoginVariant } from "../login/Login";
import { INITIAL_PASSWORD_CHANGE_PATH } from "./InitialPasswordChangePage";

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
    const { accessToken } = await login({
      accountId: formData.loginId,
      password: formData.password,
    });

    const didStoreToken = setAuthToken(accessToken);

    if (!didStoreToken) {
      throw new Error(
        "브라우저 저장소를 사용할 수 없어 로그인할 수 없습니다.",
      );
    }

    if (formData.rememberLoginId) {
      setRememberedLoginId(formData.loginId);
    } else {
      clearRememberedLoginId();
    }

    // 직원 계정(admin/user)은 초기 비밀번호를 바꾸기 전까지 다른 기능을 쓸 수 없다.
    // 민원인 계정은 직접 가입하므로 해당하지 않는다.
    const needsPasswordChange =
      variant !== "civil" &&
      (await requiresInitialPasswordChange({ token: accessToken }));

    void navigate(
      needsPasswordChange
        ? `${INITIAL_PASSWORD_CHANGE_PATH}?redirectTo=${encodeURIComponent(redirectPath)}`
        : redirectPath,
      { replace: true },
    );
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
