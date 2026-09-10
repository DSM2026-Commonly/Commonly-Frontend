// 업무 이력 조회 조건과 검증 로직. 컴포넌트 파일과 분리해 fast refresh 와 테스트에서 재사용한다.

export interface WorkHistoryFilters {
  /** yyyy-MM-dd */
  startDate: string;
  /** yyyy-MM-dd */
  endDate: string;
  /** 대상자 성명 */
  keyword: string;
}

export const EMPTY_WORK_HISTORY_FILTERS: Readonly<WorkHistoryFilters> = {
  startDate: "",
  endDate: "",
  keyword: "",
};

export const WORK_HISTORY_DATE_RANGE_ERROR_MESSAGE =
  "시작일은 종료일보다 늦을 수 없습니다.";

/** 각 조건의 앞뒤 공백을 제거한다. */
export function normalizeWorkHistoryFilters(
  filters: WorkHistoryFilters,
): WorkHistoryFilters {
  return {
    startDate: filters.startDate.trim(),
    endDate: filters.endDate.trim(),
    keyword: filters.keyword.trim(),
  };
}

/** 조회 조건이 올바르지 않으면 안내 문구를, 올바르면 빈 문자열을 돌려준다. */
export function getWorkHistoryFilterError(filters: WorkHistoryFilters): string {
  const { startDate, endDate } = normalizeWorkHistoryFilters(filters);

  // yyyy-MM-dd 형식이므로 문자열 비교로 순서를 판단할 수 있다.
  if (startDate && endDate && startDate > endDate) {
    return WORK_HISTORY_DATE_RANGE_ERROR_MESSAGE;
  }

  return "";
}

/**
 * 조회 조건을 검증한 뒤 올바르면 공백을 제거한 조건으로 `onSearch` 를 호출한다.
 * 올바르지 않으면 `onSearch` 를 호출하지 않고 안내 문구를 돌려준다.
 */
export function submitWorkHistoryFilters(
  filters: WorkHistoryFilters,
  onSearch: (filters: WorkHistoryFilters) => void,
): string {
  const error = getWorkHistoryFilterError(filters);

  if (error) {
    return error;
  }

  onSearch(normalizeWorkHistoryFilters(filters));
  return "";
}
