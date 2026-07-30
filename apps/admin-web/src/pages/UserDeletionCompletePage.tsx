import { UserManagementComplete } from "@commonly/ui";
import { useNavigate } from "react-router";

function UserDeletionCompletePage() {
  const navigate = useNavigate();

  return (
    <UserManagementComplete
      action="delete"
      onContinue={() => void navigate("/accounts/delete")}
      onHome={() => void navigate("/")}
    />
  );
}

export default UserDeletionCompletePage;
