import { UserDeletion } from "@commonly/ui";
import { useNavigate } from "react-router";

function UserDeletionPage() {
  const navigate = useNavigate();

  return (
    <UserDeletion
      onPrevious={() => void navigate("/accounts")}
      onDelete={() => void navigate("/accounts/delete/complete")}
    />
  );
}

export default UserDeletionPage;
