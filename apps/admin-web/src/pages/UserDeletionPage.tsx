import { UserDeletion, type UserAccountRecord } from "@commonly/ui";
import {
  deleteAdminUser,
  findAdminUserByAccountId,
  getAuthToken,
} from "@commonly/utils";
import { useNavigate } from "react-router";

function UserDeletionPage() {
  const navigate = useNavigate();

  const handleSearch = async (
    accountId: string,
  ): Promise<UserAccountRecord | null> => {
    const user = await findAdminUserByAccountId(accountId, {
      token: getAuthToken(),
    });

    if (!user) {
      return null;
    }

    return {
      id: String(user.userId),
      name: user.name,
      accountId: user.accountId,
      department: user.department,
    };
  };

  const handleDelete = async (account: UserAccountRecord) => {
    const userId = Number(account.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error("삭제할 사용자 정보가 올바르지 않습니다. 다시 조회해 주세요.");
    }

    await deleteAdminUser(userId, { token: getAuthToken() });
    void navigate("/accounts/delete/complete");
  };

  return (
    <UserDeletion
      onSearch={handleSearch}
      onPrevious={() => void navigate("/accounts")}
      onDelete={handleDelete}
    />
  );
}

export default UserDeletionPage;
