import { describe, expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import WorkHistory from "../src/work-history/WorkHistory";
import {
  WORK_HISTORY_DATE_RANGE_ERROR_MESSAGE,
  getWorkHistoryFilterError,
  submitWorkHistoryFilters,
} from "../src/work-history/workHistoryFilters";

describe("WorkHistory", () => {
  test("renders pagination without a direct page input", () => {
    const markup = renderToStaticMarkup(<WorkHistory />);

    expect(markup).toContain('aria-label="업무 이력 페이지"');
    expect(markup).not.toContain("페이지 바로 이동");
    expect(markup).not.toContain("이동할 페이지");
  });

  test("does not render the filter form without onSearch", () => {
    const markup = renderToStaticMarkup(<WorkHistory />);

    expect(markup).not.toContain('type="date"');
    expect(markup).not.toContain("대상자 성명");
    expect(markup).not.toContain("초기화");
  });

  test("renders the filter form with controlled values when onSearch is given", () => {
    const markup = renderToStaticMarkup(
      <WorkHistory
        filters={{
          startDate: "2026-01-01",
          endDate: "2026-01-31",
          keyword: "홍길동",
        }}
        onSearch={() => {}}
      />,
    );

    expect(markup).toContain("시작일");
    expect(markup).toContain("종료일");
    expect(markup).toContain("대상자 성명");
    expect(markup.match(/<input[^>]*type="date"/g)).toHaveLength(2);
    expect(markup).toContain('value="2026-01-01"');
    expect(markup).toContain('value="2026-01-31"');
    expect(markup).toContain('value="홍길동"');
    expect(markup).toContain(">검색</button>");
    expect(markup).toContain(">초기화</button>");
    expect(markup).not.toContain(WORK_HISTORY_DATE_RANGE_ERROR_MESSAGE);
  });

  test("shows an inline error when startDate is after endDate", () => {
    const markup = renderToStaticMarkup(
      <WorkHistory
        filters={{ startDate: "2026-02-01", endDate: "2026-01-01", keyword: "" }}
        onSearch={() => {}}
      />,
    );

    expect(markup).toContain('role="alert"');
    expect(markup).toContain(WORK_HISTORY_DATE_RANGE_ERROR_MESSAGE);
    expect(markup.match(/aria-invalid="true"/g)).toHaveLength(2);
  });

  test("submit passes trimmed filters to onSearch", () => {
    const onSearch = mock((_filters: unknown) => {});

    const error = submitWorkHistoryFilters(
      { startDate: " 2026-01-01 ", endDate: "2026-01-31", keyword: "  홍길동 " },
      onSearch,
    );

    expect(error).toBe("");
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith({
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      keyword: "홍길동",
    });
  });

  test("submit with startDate after endDate returns an error and skips onSearch", () => {
    const onSearch = mock((_filters: unknown) => {});

    const error = submitWorkHistoryFilters(
      { startDate: "2026-02-01", endDate: "2026-01-01", keyword: "" },
      onSearch,
    );

    expect(error).toBe(WORK_HISTORY_DATE_RANGE_ERROR_MESSAGE);
    expect(onSearch).not.toHaveBeenCalled();
  });

  test("accepts a single-sided or equal date range", () => {
    expect(
      getWorkHistoryFilterError({ startDate: "2026-01-01", endDate: "", keyword: "" }),
    ).toBe("");
    expect(
      getWorkHistoryFilterError({ startDate: "", endDate: "2026-01-01", keyword: "" }),
    ).toBe("");
    expect(
      getWorkHistoryFilterError({
        startDate: "2026-01-01",
        endDate: "2026-01-01",
        keyword: "",
      }),
    ).toBe("");
  });
});
