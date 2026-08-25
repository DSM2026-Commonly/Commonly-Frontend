import { Login, type LoginFormData } from "@commonly/ui";
import {
  clearRememberedLoginId,
  getRememberedLoginId,
  getSafeRedirectPath,
  login,
  setAuthTokens,
  setRememberedLoginId,
} from "@commonly/utils";
import { useLocation, useNavigate } from "react-router";

function LoginPage() {
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
      signupHref="/signup"
      variant="civil"
    />
  );
}

export default LoginPage;
