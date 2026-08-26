import { UserList } from "@commonly/ui";
import {
  ADMIN_USERS_DEFAULT_PAGE_SIZE,
  fetchAdminUsers,
  getAuthToken,
  type AdminUserSummary,
} from "@commonly/utils";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

const PAGE_SIZE = ADMIN_USERS_DEFAULT_PAGE_SIZE;

function parsePage(value: string | null): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function UserListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePage(searchParams.get("page"));
  const submittedKeyword = searchParams.get("keyword") ?? "";
  const [keyword, setKeyword] = useState(submittedKeyword);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setKeyword(submittedKeyword);
  }, [submittedKeyword]);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setErrorMessage("");

    fetchAdminUsers(
      { page, size: PAGE_SIZE, keyword: submittedKeyword },
      { token: getAuthToken(), signal: controller.signal },
    )
      .then((result) => {
        if (!controller.signal.aborted) {
          setUsers(result.content);
          setTotalPages(result.totalPages);
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setUsers([]);
        setTotalPages(1);
        setErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : "사용자 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [page, submittedKeyword]);

  const updateSearchParams = (nextPage: number, nextKeyword: string) => {
    const params = new URLSearchParams();

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }

    if (nextKeyword) {
      params.set("keyword", nextKeyword);
    }

    setSearchParams(params);
  };

  return (
    <UserList
      accounts={users.map((user) => ({
        id: String(user.userId),
        name: user.name,
        accountId: user.accountId,
        department: user.department,
      }))}
      page={page}
      totalPages={totalPages}
      onPageChange={(nextPage) => updateSearchParams(nextPage, submittedKeyword)}
      keyword={keyword}
      onKeywordChange={setKeyword}
      onSearch={(nextKeyword) => updateSearchParams(1, nextKeyword)}
      isLoading={isLoading}
      errorMessage={errorMessage}
      emptyMessage={
        submittedKeyword
          ? `'${submittedKeyword}' 이름으로 조회된 사용자가 없습니다.`
          : "조회된 사용자가 없습니다."
      }
    />
  );
}

export default UserListPage;
