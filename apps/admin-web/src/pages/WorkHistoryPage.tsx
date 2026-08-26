import { WorkHistory } from "@commonly/ui";
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

function parsePage(value: string | null): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
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

function WorkHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePage(searchParams.get("page"));
  const [histories, setHistories] = useState<IssuanceHistory[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setErrorMessage("");

    fetchIssuanceHistories(
      { page, size: PAGE_SIZE },
      { token: getAuthToken(), signal: controller.signal },
    )
      .then((result) => {
        if (!controller.signal.aborted) {
          setHistories(result.content);
          setTotalPages(result.totalPage);
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setHistories([]);
        setTotalPages(1);
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
  }, [page]);

  return (
    <WorkHistory
      records={histories.map((history, index) => ({
        id: String((page - 1) * PAGE_SIZE + index + 1).padStart(3, "0"),
        category: getIssuanceHistoryTypeLabel(history.type) || "-",
        occurredAt: formatIssuanceDate(history.issuanceDate),
        details:
          [history.targetName, history.reason].filter(Boolean).join(" · ") ||
          "-",
        operator: formatOperator(history),
      }))}
      page={page}
      totalPages={totalPages}
      onPageChange={(nextPage) =>
        setSearchParams(nextPage > 1 ? { page: String(nextPage) } : {})
      }
      isLoading={isLoading}
      errorMessage={errorMessage}
    />
  );
}

export default WorkHistoryPage;
