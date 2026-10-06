import type { CertificateCareerRow } from "./CareerCertificateIssue.types";

/**
 * 대체 미리보기를 서버 PDF(CertificatePdfRenderer)와 같은 값으로 그리기 위한 계산.
 * 규칙을 바꿀 때는 백엔드 WorkPeriodCalculator·CertificatePdfRenderer 와 함께 바꾼다.
 */

/** 서식 재직사항 표는 10행 고정이다. 모자라면 빈 행으로 채운다. */
export const CERTIFICATE_WORK_ROWS = 10;

/** 경력 합산은 1개월을 30일로 본다. */
const DAYS_PER_MONTH = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseIsoDate(value: string | undefined): number | null {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/** "2020-03-01" → "2020.03.01." (서식 날짜 표기). 날짜가 아니면 빈 문자열. */
export function formatDocumentDate(value: string | undefined): string {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  return match ? `${match[1]}.${match[2]}.${match[3]}.` : "";
}

/**
 * 총 근무기간. 행마다 양 끝을 포함한 일수를 더한 뒤 개월·일로 나눈다.
 * 시작일이나 종료일이 없는 행(재직 중 등)과 종료일이 시작일보다 앞선 행은 0일로 본다.
 */
export function calculateTotalWorkPeriod(
  rows: readonly CertificateCareerRow[],
): { months: number; days: number } {
  const totalDays = rows.reduce((sum, row) => {
    const from = parseIsoDate(row.startDate);
    const to = parseIsoDate(row.endDate);

    if (from === null || to === null || to < from) {
      return sum;
    }

    return sum + Math.round((to - from) / MS_PER_DAY) + 1;
  }, 0);

  return {
    months: Math.floor(totalDays / DAYS_PER_MONTH),
    days: totalDays % DAYS_PER_MONTH,
  };
}

/**
 * 서식에 퇴직사유 칸이 하나뿐이라 마지막(가장 최근 입사) 이력의 사유만 찍는다.
 * 경력 목록은 서버가 입사일 오름차순으로 주므로 맨 끝 행이 마지막 이력이다.
 */
export function getLastRetirementReason(
  rows: readonly CertificateCareerRow[],
): string {
  return rows.at(-1)?.reason?.trim() ?? "";
}

/** 발급일 표기 "2026.  10.  6." (서식과 같은 간격). */
export function formatIssuedDate(date: Date): string {
  return `${date.getFullYear()}.  ${date.getMonth() + 1}.  ${date.getDate()}.`;
}
