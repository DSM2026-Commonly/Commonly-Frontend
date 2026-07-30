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
  totalPages?: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
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
  totalPages = 3,
  initialPage = 1,
  onPageChange,
}: WorkHistoryProps) {
  const titleId = useId();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  const changePage = (page: number) => {
    const nextPage = Math.max(1, Math.min(totalPages, page));

    setCurrentPage(nextPage);
    onPageChange?.(nextPage);
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
            {records.map((record) => (
              <Table.Tr key={record.id}>
                <Table.Td>{record.id}</Table.Td>
                <Table.Td>{record.category}</Table.Td>
                <Table.Td>{record.occurredAt}</Table.Td>
                <Table.Td>{record.details}</Table.Td>
                <Table.Td>{record.operator}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </TableFrame>

      <PaginationFrame>
        <PaginationNav aria-label="업무 이력 페이지">
          <PageMoveButton
            $direction="prev"
            aria-label="이전 페이지"
            disabled={currentPage === 1}
            type="button"
            onClick={() => changePage(currentPage - 1)}
          >
            <PageMoveIcon $direction="prev" aria-hidden="true" />
            이전
          </PageMoveButton>
          <PageNumberList>
            {visiblePages.map((page, index) =>
              page === "ellipsis" ? (
                <PageEllipsis aria-hidden="true" key={`ellipsis-${index}`}>
                  ···
                </PageEllipsis>
              ) : (
                <PageNumberButton
                  $active={page === currentPage}
                  aria-current={page === currentPage ? "page" : undefined}
                  aria-label={`${page}페이지`}
                  key={page}
                  type="button"
                  onClick={() => changePage(page)}
                >
                  {page}
                </PageNumberButton>
              ),
            )}
          </PageNumberList>
          <PageMoveButton
            $direction="next"
            aria-label="다음 페이지"
            disabled={currentPage === totalPages}
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
