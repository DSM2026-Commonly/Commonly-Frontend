import { Login, type LoginFormData } from "@commonly/ui";
import {
  clearRememberedLoginId,
  createLocalSessionToken,
  getRememberedLoginId,
  getSafeRedirectPath,
  setAuthToken,
  setRememberedLoginId,
} from "@commonly/utils";
import { useLocation, useNavigate } from "react-router";

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const redirectPath = getSafeRedirectPath(
    new URLSearchParams(location.search).get("redirectTo"),
  );

  const handleLogin = (formData: LoginFormData) => {
    const didStoreToken = setAuthToken(createLocalSessionToken());

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

    void navigate(redirectPath, { replace: true });
  };

  return (
    <Login
      initialLoginId={getRememberedLoginId()}
      onSubmit={handleLogin}
    />
  );
}

export default LoginPage;
