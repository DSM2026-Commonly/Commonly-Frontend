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

function buildSearchParams(page: number, keyword: string): URLSearchParams {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  const trimmedKeyword = keyword.trim();

  if (trimmedKeyword) {
    params.set("keyword", trimmedKeyword);
  }

  return params;
}

function UserListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePage(searchParams.get("page"));
  const submittedKeyword = searchParams.get("keyword") ?? "";
  const [keyword, setKeyword] = useState(submittedKeyword);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  // 서버가 전체 페이지 수를 주지 않으면 null (다음 페이지 여부만 사용).
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  // 같은 조건으로 다시 검색해도(URL 불변) 재조회되도록 하는 카운터.
  const [reloadCount, setReloadCount] = useState(0);

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
        if (controller.signal.aborted) {
          return;
        }

        // 전체 페이지 수를 아는 경우 범위 밖 페이지는 마지막 페이지로 보정한다.
        if (result.totalPages !== null && page > result.totalPages) {
          setSearchParams(
            buildSearchParams(result.totalPages, submittedKeyword),
            { replace: true },
          );
          return;
        }

        setUsers(result.content);
        setTotalPages(result.totalPages);
        setHasNextPage(result.hasNextPage);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setUsers([]);
        setTotalPages(null);
        setHasNextPage(false);
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
  }, [page, submittedKeyword, setSearchParams, reloadCount]);

  const updateSearchParams = (nextPage: number, nextKeyword: string) => {
    setSearchParams(buildSearchParams(nextPage, nextKeyword));
  };

  const handleSearch = (nextKeyword: string) => {
    updateSearchParams(1, nextKeyword);
    setReloadCount((count) => count + 1);
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
      totalPages={totalPages ?? undefined}
      hasNextPage={hasNextPage}
      onPageChange={(nextPage) => updateSearchParams(nextPage, submittedKeyword)}
      keyword={keyword}
      onKeywordChange={setKeyword}
      onSearch={handleSearch}
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
