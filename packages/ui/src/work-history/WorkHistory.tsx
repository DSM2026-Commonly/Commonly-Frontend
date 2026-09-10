import "krds-react/dist/index.css";

import { Button, Table, TextInput } from "krds-react";
import { useId, useState, type FormEvent } from "react";
import {
  EMPTY_WORK_HISTORY_FILTERS,
  getWorkHistoryFilterError,
  submitWorkHistoryFilters,
  type WorkHistoryFilters,
} from "./workHistoryFilters";
import {
  FilterActions,
  FilterError,
  FilterField,
  FilterForm,
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
  /** 조회 조건 (제어 모드). 생략하면 내부 상태로 관리한다. */
  filters?: WorkHistoryFilters;
  onFiltersChange?: (filters: WorkHistoryFilters) => void;
  /** 검색 버튼 클릭 / 엔터 시 호출. 생략하면 조회 조건 UI를 표시하지 않는다. */
  onSearch?: (filters: WorkHistoryFilters) => void;
  /** 초기화 버튼 클릭 시 호출. 생략하면 빈 조건으로 `onSearch` 를 호출한다. */
  onReset?: (filters: WorkHistoryFilters) => void;
  isLoading?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
}

// 실제 데이터는 페이지가 API 로 조회해 넘긴다. 기본값은 빈 목록.
const DEFAULT_RECORDS: readonly WorkHistoryRecord[] = [];

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

interface DateFieldProps {
  id: string;
  label: string;
  value: string;
  max?: string;
  min?: string;
  describedBy?: string;
  invalid: boolean;
  onChange: (value: string) => void;
}

/** krds TextInput 과 같은 마크업을 사용해 높이/테두리를 맞춘 날짜 입력 */
function DateField({
  id,
  label,
  value,
  max,
  min,
  describedBy,
  invalid,
  onChange,
}: DateFieldProps) {
  return (
    <FilterField>
      <div className="form-group">
        <div className="form-tit">
          <label htmlFor={id}>{label}</label>
        </div>
        <div className="form-conts">
          <input
            id={id}
            type="date"
            className="krds-input large"
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            max={max || undefined}
            min={min || undefined}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      </div>
    </FilterField>
  );
}

function WorkHistory({
  records = DEFAULT_RECORDS,
  totalPages = records === DEFAULT_RECORDS ? 1 : undefined,
  page,
  initialPage = 1,
  hasNextPage = false,
  onPageChange,
  filters,
  onFiltersChange,
  onSearch,
  onReset,
  isLoading = false,
  errorMessage = "",
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
}: WorkHistoryProps) {
  const titleId = useId();
  const startDateInputId = useId();
  const endDateInputId = useId();
  const keywordInputId = useId();
  const filterErrorId = useId();
  const [internalPage, setInternalPage] = useState(
    Math.max(1, Math.floor(initialPage)),
  );
  const [internalFilters, setInternalFilters] = useState<WorkHistoryFilters>({
    ...EMPTY_WORK_HISTORY_FILTERS,
  });
  const requestedPage =
    page === undefined ? internalPage : Math.max(1, Math.floor(page));
  const knownTotalPages =
    totalPages === undefined ? undefined : Math.max(1, Math.floor(totalPages));
  // 범위 밖 페이지로 초기화되어도 마지막 페이지로 보정한다.
  const currentPage =
    knownTotalPages === undefined
      ? requestedPage
      : Math.min(requestedPage, knownTotalPages);
  const currentFilters = filters === undefined ? internalFilters : filters;
  // totalPages 를 모르는 경우 현재 페이지(+다음 페이지 존재 시 1)까지만 노출한다.
  const normalizedTotalPages =
    knownTotalPages ?? (currentPage + (hasNextPage ? 1 : 0));
  const visiblePages = getVisiblePages(currentPage, normalizedTotalPages);
  const isLastPage =
    totalPages === undefined ? !hasNextPage : currentPage >= normalizedTotalPages;
  const hasSearch = onSearch !== undefined;
  const filterError = hasSearch ? getWorkHistoryFilterError(currentFilters) : "";
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

  const changeFilters = (nextFilters: WorkHistoryFilters) => {
    if (filters === undefined) {
      setInternalFilters(nextFilters);
    }

    onFiltersChange?.(nextFilters);
  };

  const changeFilter = (field: keyof WorkHistoryFilters, value: string) => {
    changeFilters({ ...currentFilters, [field]: value });
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!onSearch) {
      return;
    }

    // 잘못된 기간이면 안내 문구만 보여주고 조회하지 않는다.
    submitWorkHistoryFilters(currentFilters, onSearch);
  };

  const handleReset = () => {
    const emptyFilters = { ...EMPTY_WORK_HISTORY_FILTERS };

    changeFilters(emptyFilters);
    (onReset ?? onSearch)?.(emptyFilters);
  };

  return (
    <WorkHistoryRoot aria-labelledby={titleId}>
      <PageTitle id={titleId}>업무 이력 조회</PageTitle>

      {hasSearch && (
        <FilterForm noValidate onSubmit={handleSearch}>
          <DateField
            id={startDateInputId}
            label="시작일"
            value={currentFilters.startDate}
            max={currentFilters.endDate}
            describedBy={filterError ? filterErrorId : undefined}
            invalid={Boolean(filterError)}
            onChange={(value) => changeFilter("startDate", value)}
          />
          <DateField
            id={endDateInputId}
            label="종료일"
            value={currentFilters.endDate}
            min={currentFilters.startDate}
            describedBy={filterError ? filterErrorId : undefined}
            invalid={Boolean(filterError)}
            onChange={(value) => changeFilter("endDate", value)}
          />
          <FilterField $grow>
            <TextInput
              id={keywordInputId}
              name="keyword"
              label="대상자 성명"
              placeholder="대상자 성명을 입력해주세요"
              value={currentFilters.keyword}
              onChange={(value) => changeFilter("keyword", value)}
            />
          </FilterField>
          <FilterActions>
            <Button
              variant="secondary"
              size="large"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "조회 중..." : "검색"}
            </Button>
            <Button
              variant="tertiary"
              size="large"
              type="button"
              disabled={isLoading}
              onClick={handleReset}
            >
              초기화
            </Button>
          </FilterActions>
          {filterError && (
            <FilterError id={filterErrorId} role="alert">
              {filterError}
            </FilterError>
          )}
        </FilterForm>
      )}

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
