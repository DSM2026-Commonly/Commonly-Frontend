import { UserRegistration, type UserRegistrationData } from "@commonly/ui";
import { createAdminUser, getAuthToken } from "@commonly/utils";
import { useNavigate } from "react-router";

function UserRegistrationPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: UserRegistrationData) => {
    await createAdminUser(
      {
        accountId: data.accountId,
        name: data.name,
        department: data.department,
      },
      { token: getAuthToken() },
    );
    void navigate("/accounts/register/complete", {
      state: { accountId: data.accountId },
    });
  };

  return (
    <UserRegistration
      onPrevious={() => void navigate("/accounts")}
      onSubmit={handleSubmit}
    />
  );
}

export default UserRegistrationPage;
