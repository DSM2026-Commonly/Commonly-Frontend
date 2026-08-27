import { UserManagementComplete } from "@commonly/ui";
import { ADMIN_USER_INITIAL_PASSWORD } from "@commonly/utils";
import { useLocation, useNavigate } from "react-router";

function UserRegistrationCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { accountId?: unknown } | null;
  const accountId =
    typeof state?.accountId === "string" ? state.accountId : null;

  return (
    <UserManagementComplete
      action="register"
      details={
        accountId
          ? [
              { label: "아이디", value: accountId },
              { label: "초기 비밀번호", value: ADMIN_USER_INITIAL_PASSWORD },
            ]
          : undefined
      }
      onContinue={() => void navigate("/accounts/register")}
      onHome={() => void navigate("/")}
    />
  );
}

export default UserRegistrationCompletePage;
