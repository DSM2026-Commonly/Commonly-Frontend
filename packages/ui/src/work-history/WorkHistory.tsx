import "krds-react/dist/index.css";

import { Table } from "krds-react";
import { useId, useState } from "react";
import {
  PageTitle,
  PageEllipsis,
  PageMoveButton,
  PageMoveIcon,
  PageNumberButton,
  PageNumberList,
  PaginationFrame,
  PaginationNav,
  TableFrame,
  TableStatus,
  WorkHistoryRoot,
} from "./WorkHistory.styles";

export interface WorkHistoryRecord {
  id: string;
  category: string;
  occurredAt: string;
  details: string;
  operator: string;
}

export interface WorkHistoryProps {
  records?: readonly WorkHistoryRecord[];
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
  isLoading?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
}

const DEFAULT_RECORDS: readonly WorkHistoryRecord[] = Array.from(
  { length: 10 },
  (_, index) => ({
    id: String(index + 1).padStart(3, "0"),
    category:
      index === 1
        ? "경력사항 수정"
        : index === 2
          ? "증명서 발급"
          : "경력사항 등록",
    occurredAt: "2026-02-01",
    details: "대전광역시 유성구 가정북로 76",
    operator: "전재준",
  }),
);

const DEFAULT_EMPTY_MESSAGE = "조회된 이력이 없습니다.";

type VisiblePage = number | "ellipsis";

function getVisiblePages(
  currentPage: number,
  totalPages: number,
): readonly VisiblePage[] {
  if (totalPages <= 8) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 6, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 5,
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

function WorkHistory({
  records = DEFAULT_RECORDS,
  totalPages = records === DEFAULT_RECORDS ? 3 : undefined,
  page,
  initialPage = 1,
  hasNextPage = false,
  onPageChange,
  isLoading = false,
  errorMessage = "",
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
}: WorkHistoryProps) {
  const titleId = useId();
  const [internalPage, setInternalPage] = useState(
    Math.max(1, Math.floor(initialPage)),
  );
  const currentPage =
    page === undefined ? internalPage : Math.max(1, Math.floor(page));
  // totalPages 를 모르는 경우 현재 페이지(+다음 페이지 존재 시 1)까지만 노출한다.
  const normalizedTotalPages =
    totalPages === undefined
      ? currentPage + (hasNextPage ? 1 : 0)
      : Math.max(1, Math.floor(totalPages));
  const visiblePages = getVisiblePages(currentPage, normalizedTotalPages);
  const isLastPage =
    totalPages === undefined ? !hasNextPage : currentPage >= normalizedTotalPages;
  const showTable = !isLoading && !errorMessage && records.length > 0;

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

  return (
    <WorkHistoryRoot aria-labelledby={titleId}>
      <PageTitle id={titleId}>업무 이력 조회</PageTitle>

      <TableFrame>
        <Table>
          <Table.Caption className="sr-only">
            경력관리 시스템 업무 처리 이력
          </Table.Caption>
          <Table.Colgroup>
            <Table.Col width="80px" />
            <Table.Col width="135px" />
            <Table.Col width="221px" />
            <Table.Col width="394px" />
            <Table.Col width="150px" />
          </Table.Colgroup>
          <Table.Thead>
            <Table.Tr>
              <Table.Th scope="col">순번</Table.Th>
              <Table.Th scope="col">구분</Table.Th>
              <Table.Th scope="col">일시</Table.Th>
              <Table.Th scope="col">상세 내용(사유)</Table.Th>
              <Table.Th scope="col">업무 처리자</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {showTable ? (
              records.map((record) => (
                <Table.Tr key={record.id}>
                  <Table.Td>{record.id}</Table.Td>
                  <Table.Td>{record.category}</Table.Td>
                  <Table.Td>{record.occurredAt}</Table.Td>
                  <Table.Td>{record.details}</Table.Td>
                  <Table.Td>{record.operator}</Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <TableStatus
                    $tone={errorMessage ? "error" : "muted"}
                    role={errorMessage ? "alert" : "status"}
                    aria-live="polite"
                  >
                    {isLoading
                      ? "이력을 불러오는 중입니다."
                      : errorMessage || emptyMessage}
                  </TableStatus>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </TableFrame>

      <PaginationFrame>
        <PaginationNav aria-label="업무 이력 페이지">
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
                  aria-current={visiblePage === currentPage ? "page" : undefined}
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
    </WorkHistoryRoot>
  );
}

export default WorkHistory;
