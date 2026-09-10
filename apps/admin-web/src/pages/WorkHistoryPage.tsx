import { WorkHistory, type WorkHistoryFilters } from "@commonly/ui";
import {
  ISSUANCE_HISTORIES_DEFAULT_PAGE_SIZE,
  fetchIssuanceHistories,
  getAuthToken,
  getIssuanceHistoryTypeLabel,
  type IssuanceHistory,
} from "@commonly/utils";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

const PAGE_SIZE = ISSUANCE_HISTORIES_DEFAULT_PAGE_SIZE;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parsePage(value: string | null): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

/** URL 의 날짜 파라미터는 yyyy-MM-dd 형식만 받는다. */
function parseDate(value: string | null): string {
  const trimmed = (value ?? "").trim();
  return DATE_PATTERN.test(trimmed) ? trimmed : "";
}

function buildSearchParams(
  page: number,
  filters: WorkHistoryFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  for (const key of ["startDate", "endDate", "keyword"] as const) {
    const trimmed = filters[key].trim();

    if (trimmed) {
      params.set(key, trimmed);
    }
  }

  return params;
}

/** "2026-08-26T14:30:00" → "2026-08-26 14:30" */
function formatIssuanceDate(value: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/.exec(value);

  if (!match) {
    return value || "-";
  }

  return match[2] ? `${match[1]} ${match[2]}` : match[1];
}

function formatOperator(history: IssuanceHistory): string {
  const parts = [history.issuerName, history.issuerDepartment].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "-";
}

/** 예: "유성구-2026-000001 · 홍길동 · 은행 제출" */
function formatDetails(history: IssuanceHistory): string {
  return (
    [
      history.documentNo,
      history.targetName,
      history.certificate.purpose || history.reason,
    ]
      .filter(Boolean)
      .join(" · ") || "-"
  );
}

function WorkHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePage(searchParams.get("page"));
  const submittedStartDate = parseDate(searchParams.get("startDate"));
  const submittedEndDate = parseDate(searchParams.get("endDate"));
  const submittedKeyword = searchParams.get("keyword")?.trim() ?? "";
  const hasSubmittedFilters = Boolean(
    submittedStartDate || submittedEndDate || submittedKeyword,
  );
  const [filters, setFilters] = useState<WorkHistoryFilters>({
    startDate: submittedStartDate,
    endDate: submittedEndDate,
    keyword: submittedKeyword,
  });
  const [histories, setHistories] = useState<IssuanceHistory[]>([]);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  // 같은 조건으로 다시 검색해도(URL 불변) 재조회되도록 하는 카운터.
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    setFilters({
      startDate: submittedStartDate,
      endDate: submittedEndDate,
      keyword: submittedKeyword,
    });
  }, [submittedStartDate, submittedEndDate, submittedKeyword]);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setErrorMessage("");

    fetchIssuanceHistories(
      {
        page,
        size: PAGE_SIZE,
        startDate: submittedStartDate,
        endDate: submittedEndDate,
        keyword: submittedKeyword,
      },
      { token: getAuthToken(), signal: controller.signal },
    )
      .then((result) => {
        if (controller.signal.aborted) {
          return;
        }

        // 전체 페이지 수를 아는 경우 범위 밖 페이지는 마지막 페이지로 보정한다.
        if (result.totalPage !== null && page > result.totalPage) {
          setSearchParams(
            buildSearchParams(result.totalPage, {
              startDate: submittedStartDate,
              endDate: submittedEndDate,
              keyword: submittedKeyword,
            }),
            { replace: true },
          );
          return;
        }

        setHistories(result.content);
        setTotalPages(result.totalPage);
        setHasNextPage(result.hasNextPage);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setHistories([]);
        setTotalPages(null);
        setHasNextPage(false);
        setErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : "이력을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [
    page,
    submittedStartDate,
    submittedEndDate,
    submittedKeyword,
    setSearchParams,
    reloadCount,
  ]);

  const updateSearchParams = (
    nextPage: number,
    nextFilters: WorkHistoryFilters,
  ) => {
    setSearchParams(buildSearchParams(nextPage, nextFilters));
  };

  const handleSearch = (nextFilters: WorkHistoryFilters) => {
    updateSearchParams(1, nextFilters);
    setReloadCount((count) => count + 1);
  };

  return (
    <WorkHistory
      records={histories.map((history, index) => ({
        id: String((page - 1) * PAGE_SIZE + index + 1).padStart(3, "0"),
        category: getIssuanceHistoryTypeLabel(history.type) || "-",
        occurredAt: formatIssuanceDate(history.issuanceDate),
        details: formatDetails(history),
        operator: formatOperator(history),
      }))}
      page={page}
      totalPages={totalPages ?? undefined}
      hasNextPage={hasNextPage}
      onPageChange={(nextPage) =>
        updateSearchParams(nextPage, {
          startDate: submittedStartDate,
          endDate: submittedEndDate,
          keyword: submittedKeyword,
        })
      }
      filters={filters}
      onFiltersChange={setFilters}
      onSearch={handleSearch}
      onReset={handleSearch}
      isLoading={isLoading}
      errorMessage={errorMessage}
      emptyMessage={
        hasSubmittedFilters
          ? "조회 조건에 맞는 이력이 없습니다."
          : "조회된 이력이 없습니다."
      }
    />
  );
}

export default WorkHistoryPage;
