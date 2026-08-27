import "krds-react/dist/index.css";

import { Button, Table, TextInput } from "krds-react";
import { useId, useState, type FormEvent } from "react";
import {
  PageEllipsis,
  PageMoveButton,
  PageMoveIcon,
  PageNumberButton,
  PageNumberList,
  PaginationFrame,
  PaginationNav,
} from "../work-history/WorkHistory.styles";
import type { UserAccountRecord } from "./UserDeletion";
import {
  UserListCard,
  UserListContent,
  UserListRoot,
  UserListSearchForm,
  UserListStatus,
  UserListTableFrame,
} from "./UserList.styles";
import { FormSectionTitle, PageTitle } from "./userManagement.styles";

export interface UserListProps {
  accounts?: readonly UserAccountRecord[];
  /**
   * 전체 페이지 수. 서버가 전체 개수를 주지 않는 경우 생략하고
   * `hasNextPage` 로 다음 페이지 존재 여부만 알려줄 수 있다.
   */
  totalPages?: number;
  /** 현재 페이지 (제어 모드). 생략하면 내부 상태로 관리한다. */
  page?: number;
  initialPage?: number;
  /** `totalPages` 가 없을 때 다음 페이지가 있는지 여부 */
  hasNextPage?: boolean;
  onPageChange?: (page: number) => void;
  /** 이름 검색어 (제어 모드). 생략하면 내부 상태로 관리한다. */
  keyword?: string;
  onKeywordChange?: (keyword: string) => void;
  /** 검색 버튼 클릭 / 엔터 시 호출. 생략하면 검색 UI를 표시하지 않는다. */
  onSearch?: (keyword: string) => void;
  isLoading?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
}

const DEFAULT_ACCOUNTS: readonly UserAccountRecord[] = Array.from(
  { length: 10 },
  (_, index) => ({
    id: `user-${index + 1}`,
    name: "전재준",
    accountId: "글로리1234",
    department: "대전광역시 유성구 가정북로 76",
  }),
);

const DEFAULT_EMPTY_MESSAGE = "조회된 사용자가 없습니다.";

type VisiblePage = number | "ellipsis";

function getVisiblePages(
  currentPage: number,
  totalPages: number,
): readonly VisiblePage[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

function UserList({
  accounts = DEFAULT_ACCOUNTS,
  totalPages,
  page,
  initialPage = 1,
  hasNextPage = false,
  onPageChange,
  keyword,
  onKeywordChange,
  onSearch,
  isLoading = false,
  errorMessage = "",
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
}: UserListProps) {
  const titleId = useId();
  const cardTitleId = useId();
  const keywordInputId = useId();
  const [internalPage, setInternalPage] = useState(
    Math.max(1, Math.floor(initialPage)),
  );
  const [internalKeyword, setInternalKeyword] = useState("");
  const currentPage =
    page === undefined ? internalPage : Math.max(1, Math.floor(page));
  const currentKeyword = keyword === undefined ? internalKeyword : keyword;

  // totalPages 를 모르는 경우 현재 페이지(+다음 페이지 존재 시 1)까지만 노출한다.
  const normalizedTotalPages =
    totalPages === undefined
      ? currentPage + (hasNextPage ? 1 : 0)
      : Math.max(1, Math.floor(totalPages));
  const visiblePages = getVisiblePages(currentPage, normalizedTotalPages);
  const isLastPage =
    totalPages === undefined ? !hasNextPage : currentPage >= normalizedTotalPages;
  const hasSearch = onSearch !== undefined;
  const showTable = !isLoading && !errorMessage && accounts.length > 0;

  const changePage = (nextPage: number) => {
    const clampedPage = Math.max(1, Math.min(normalizedTotalPages, nextPage));

    if (clampedPage === currentPage) {
      return;
    }

    if (page === undefined) {
      setInternalPage(clampedPage);
    }

    onPageChange?.(clampedPage);
  };

  const changeKeyword = (nextKeyword: string) => {
    if (keyword === undefined) {
      setInternalKeyword(nextKeyword);
    }

    onKeywordChange?.(nextKeyword);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch?.(currentKeyword.trim());
  };

  return (
    <UserListRoot aria-labelledby={titleId}>
      <PageTitle id={titleId}>사용자 목록 조회</PageTitle>

      <UserListContent>
        <UserListCard aria-labelledby={cardTitleId}>
          <FormSectionTitle id={cardTitleId}>사용자 목록 조회</FormSectionTitle>

          {hasSearch && (
            <UserListSearchForm noValidate onSubmit={handleSearch}>
              <TextInput
                id={keywordInputId}
                name="keyword"
                label="이름"
                placeholder="이름을 입력해주세요"
                value={currentKeyword}
                onChange={changeKeyword}
              />
              <Button
                variant="secondary"
                size="large"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "조회 중..." : "검색"}
              </Button>
            </UserListSearchForm>
          )}

          <UserListTableFrame>
            <Table>
              <Table.Caption className="sr-only">
                경력관리 시스템 사용자 목록
              </Table.Caption>
              <Table.Colgroup>
                <Table.Col width="165px" />
                <Table.Col width="216px" />
                <Table.Col width="331px" />
              </Table.Colgroup>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th scope="col">이름</Table.Th>
                  <Table.Th scope="col">아이디</Table.Th>
                  <Table.Th scope="col">소속 부서</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {showTable ? (
                  accounts.map((account) => (
                    <Table.Tr key={account.id}>
                      <Table.Td>{account.name}</Table.Td>
                      <Table.Td>{account.accountId}</Table.Td>
                      <Table.Td>{account.department}</Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={3}>
                      <UserListStatus
                        $tone={errorMessage ? "error" : "muted"}
                        role={errorMessage ? "alert" : "status"}
                        aria-live="polite"
                      >
                        {isLoading
                          ? "사용자 목록을 불러오는 중입니다."
                          : errorMessage || emptyMessage}
                      </UserListStatus>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </UserListTableFrame>

          <PaginationFrame>
            <PaginationNav aria-label="사용자 목록 페이지">
              <PageMoveButton
                $direction="prev"
                aria-label="이전 페이지"
                disabled={currentPage === 1 || isLoading}
                type="button"
                onClick={() => changePage(currentPage - 1)}
              >
                <PageMoveIcon $direction="prev" aria-hidden="true" />
                이전
              </PageMoveButton>
              <PageNumberList>
                {visiblePages.map((visiblePage, index) =>
                  visiblePage === "ellipsis" ? (
                    <PageEllipsis aria-hidden="true" key={`ellipsis-${index}`}>
                      ···
                    </PageEllipsis>
                  ) : (
                    <PageNumberButton
                      $active={visiblePage === currentPage}
                      aria-current={
                        visiblePage === currentPage ? "page" : undefined
                      }
                      aria-label={`${visiblePage}페이지`}
                      disabled={isLoading}
                      key={visiblePage}
                      type="button"
                      onClick={() => changePage(visiblePage)}
                    >
                      {visiblePage}
                    </PageNumberButton>
                  ),
                )}
              </PageNumberList>
              <PageMoveButton
                $direction="next"
                aria-label="다음 페이지"
                disabled={isLastPage || isLoading}
                type="button"
                onClick={() => changePage(currentPage + 1)}
              >
                다음
                <PageMoveIcon $direction="next" aria-hidden="true" />
              </PageMoveButton>
            </PaginationNav>
          </PaginationFrame>
        </UserListCard>
      </UserListContent>
    </UserListRoot>
  );
}

export default UserList;
