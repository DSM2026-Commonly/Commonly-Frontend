import { describe, expect, test } from "bun:test";
import type { CertificateCareerRow } from "../src/career-certificate/CareerCertificateIssue.types";
import {
  calculateTotalWorkPeriod,
  formatDocumentDate,
  formatIssuedDate,
  getLastRetirementReason,
} from "../src/career-certificate/certificateDocument";

function row(
  startDate: string,
  endDate: string,
  reason = "",
): CertificateCareerRow {
  return {
    id: `${startDate}-${endDate}`,
    job: "",
    department: "",
    period: "",
    startDate,
    endDate,
    reason,
  };
}

describe("certificate document values (same rules as the server PDF)", () => {
  test("formats dates in the certificate notation", () => {
    expect(formatDocumentDate("2020-03-01")).toBe("2020.03.01.");
    expect(formatDocumentDate("")).toBe("");
    expect(formatDocumentDate(undefined)).toBe("");
    expect(formatIssuedDate(new Date(2026, 9, 6))).toBe("2026.  10.  6.");
  });

  // 서버가 같은 세 이력으로 만든 PDF 에 "총 58 개월 27 일"이 찍혔다.
  test("matches the server total for the same careers", () => {
    expect(
      calculateTotalWorkPeriod([
        row("2020-03-01", "2022-02-28"),
        row("2022-03-01", "2024-02-29"),
        row("2024-03-01", "2024-12-31"),
      ]),
    ).toEqual({ months: 58, days: 27 });
  });

  test("counts both ends and skips rows without an end or with reversed dates", () => {
    expect(calculateTotalWorkPeriod([row("2020-01-01", "2020-01-01")])).toEqual({
      months: 0,
      days: 1,
    });
    expect(
      calculateTotalWorkPeriod([
        row("2020-01-01", ""),
        row("2020-05-01", "2020-04-01"),
      ]),
    ).toEqual({ months: 0, days: 0 });
  });

  test("uses only the last career's retirement reason", () => {
    expect(
      getLastRetirementReason([
        row("2020-01-01", "2020-12-31", "계약만료"),
        row("2021-01-01", "2021-12-31", " 자진퇴사 "),
      ]),
    ).toBe("자진퇴사");
    expect(getLastRetirementReason([])).toBe("");
  });
});
