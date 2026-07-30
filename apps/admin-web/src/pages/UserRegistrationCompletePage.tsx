import { UserManagementComplete } from "@commonly/ui";
import { useNavigate } from "react-router";

function UserRegistrationCompletePage() {
  const navigate = useNavigate();

  return (
    <UserManagementComplete
      action="register"
      onContinue={() => void navigate("/accounts/register")}
      onHome={() => void navigate("/")}
    />
  );
}

export default UserRegistrationCompletePage;
