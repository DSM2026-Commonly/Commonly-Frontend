import { UserRegistration } from "@commonly/ui";
import { useNavigate } from "react-router";

function UserRegistrationPage() {
  const navigate = useNavigate();

  return (
    <UserRegistration
      onPrevious={() => void navigate("/accounts")}
      onSubmit={() => void navigate("/accounts/register/complete")}
    />
  );
}

export default UserRegistrationPage;
