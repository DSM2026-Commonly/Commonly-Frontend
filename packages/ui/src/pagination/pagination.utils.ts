/**
 * 페이지 응답이 비었을 때 다시 조회할 페이지(1부터 시작)를 고른다.
 * 2페이지 이상이 비었다면 그 사이 데이터가 줄었을 뿐 앞 페이지엔 결과가 남아 있을 수 있어
 * 마지막 유효 페이지로 돌아간다. 1페이지가 비었거나 결과가 있으면 다시 조회하지 않는다(null).
 * 돌아갈 페이지가 매번 줄어 1페이지에 닿으므로 끝없이 반복되지 않는다.
 */
export const getEmptyPageRetryPage = (
  page: number,
  itemCount: number,
  totalPages: number,
): number | null => {
  if (page <= 1 || itemCount > 0) {
    return null;
  }

  return Math.max(1, Math.min(page - 1, totalPages));
};
