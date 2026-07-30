import {
  UserManagementHome,
  type UserManagementAction,
} from "@commonly/ui";
import { useNavigate } from "react-router";

const actionDestinations = {
  list: "/accounts/list",
  register: "/accounts/register",
  delete: "/accounts/delete",
} as const satisfies Record<UserManagementAction, string>;

function UserManagementPage() {
  const navigate = useNavigate();

  return (
    <UserManagementHome
      onSelect={(action) => void navigate(actionDestinations[action])}
    />
  );
}

export default UserManagementPage;
