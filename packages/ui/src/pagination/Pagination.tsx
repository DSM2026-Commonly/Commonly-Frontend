import {
  PageEllipsis,
  PageMoveButton,
  PageMoveIcon,
  PageNumberButton,
  PageNumberList,
  PaginationFrame,
  PaginationNav,
} from "./Pagination.styles";

/** 페이지 단위 조회 결과. 목록과 전체 페이지 수만 공유한다. */
export interface PagedResult<T> {
  items: readonly T[];
  /** 전체 페이지 수(1 이상). */
  totalPages: number;
}

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

export interface PaginationProps {
  /** 현재 페이지(1부터 시작). */
  currentPage: number;
  /**
   * 전체 페이지 수. 서버가 전체 개수를 주지 않으면 생략하고
   * `hasNextPage` 로 다음 페이지 존재 여부만 넘길 수 있다.
   */
  totalPages?: number;
  /** `totalPages` 가 없을 때 다음 페이지가 있는지 여부. */
  hasNextPage?: boolean;
  isLoading?: boolean;
  /** 페이지네이션 nav 의 접근성 라벨. */
  navLabel: string;
  /** 페이지 번호(1부터)를 넘긴다. 범위 보정은 호출부가 담당한다. */
  onPageChange: (page: number) => void;
}

/** 업무 이력·대상자 목록 등에서 공유하는 페이지네이션 컨트롤. */
function Pagination({
  currentPage,
  totalPages,
  hasNextPage = false,
  isLoading = false,
  navLabel,
  onPageChange,
}: PaginationProps) {
  // totalPages 를 모르는 경우 현재 페이지(+다음 페이지 존재 시 1)까지만 노출한다.
  const normalizedTotalPages =
    totalPages === undefined ? currentPage + (hasNextPage ? 1 : 0) : totalPages;
  const visiblePages = getVisiblePages(currentPage, normalizedTotalPages);
  const isLastPage =
    totalPages === undefined
      ? !hasNextPage
      : currentPage >= normalizedTotalPages;

  return (
    <PaginationFrame>
      <PaginationNav aria-label={navLabel}>
        <PageMoveButton
          $direction="prev"
          aria-label="이전 페이지"
          disabled={currentPage === 1 || isLoading}
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
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
                onClick={() => onPageChange(visiblePage)}
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
          onClick={() => onPageChange(currentPage + 1)}
        >
          다음
          <PageMoveIcon $direction="next" aria-hidden="true" />
        </PageMoveButton>
      </PaginationNav>
    </PaginationFrame>
  );
}

export default Pagination;
