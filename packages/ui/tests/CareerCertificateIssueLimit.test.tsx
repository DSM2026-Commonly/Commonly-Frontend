import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { CertificateCareerRow } from "../src/career-certificate/CareerCertificateIssue.types";
import {
  isCareerSelectionWithinLimit,
  resolveIssuedIssueType,
} from "../src/career-certificate/CareerCertificateIssue.validation";
import DetailsStep from "../src/career-certificate/steps/DetailsStep";

const noop = () => undefined;

function careerRows(count: number): CertificateCareerRow[] {
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    job: `업무${index + 1}`,
    department: "총무과",
    period: "2020-03-01 ~ 2021-02-28",
  }));
}

function renderDetails(
  issueType: "all" | "selected",
  rows: CertificateCareerRow[],
  selectedCareerIds: string[],
) {
  return renderToStaticMarkup(
    <DetailsStep
      issueType={issueType}
      careerRows={rows}
      selectedCareerIds={selectedCareerIds}
      additionalNote=""
      purpose=""
      onIssueTypeChange={noop}
      onCareerSelection={noop}
      onSelectAll={noop}
      onAdditionalNoteChange={noop}
      onPurposeChange={noop}
    />,
  );
}

// emotion 이 넣는 CSS 텍스트와 섞이지 않게 비활성 속성만 센다.
function countDisabled(markup: string): number {
  return markup.match(/disabled=""/g)?.length ?? 0;
}

describe("isCareerSelectionWithinLimit", () => {
  test("allows 전체 발급 only up to 10 careers", () => {
    expect(isCareerSelectionWithinLimit("all", 10, 0)).toBe(true);
    expect(isCareerSelectionWithinLimit("all", 11, 0)).toBe(false);
  });

  test("requires 1 to 10 careers for 선택 발급", () => {
    expect(isCareerSelectionWithinLimit("selected", 15, 0)).toBe(false);
    expect(isCareerSelectionWithinLimit("selected", 15, 1)).toBe(true);
    expect(isCareerSelectionWithinLimit("selected", 15, 10)).toBe(true);
    expect(isCareerSelectionWithinLimit("selected", 15, 11)).toBe(false);
  });
});

describe("resolveIssuedIssueType", () => {
  test("treats 선택 발급 without a career list as 전체 발급", () => {
    // 민원인 목록 조회가 막혀 있으면 보낼 경력이 없어 본인 전체로 발급된다.
    expect(resolveIssuedIssueType("selected", 0)).toBe("all");
  });

  test("keeps the chosen type when careers were loaded", () => {
    expect(resolveIssuedIssueType("selected", 3)).toBe("selected");
    expect(resolveIssuedIssueType("all", 3)).toBe("all");
    expect(resolveIssuedIssueType("all", 0)).toBe("all");
  });
});

describe("DetailsStep 10건 제한", () => {
  test("disables unchecked careers once 10 are selected", () => {
    const rows = careerRows(12);
    const markup = renderDetails(
      "selected",
      rows,
      rows.slice(0, 10).map((row) => row.id),
    );

    expect(markup).toContain("최대 10건까지 선택할 수 있습니다.");
    // 고르지 않은 2건만 비활성이다. 고른 10건은 해제할 수 있어야 한다.
    expect(countDisabled(markup)).toBe(2);
  });

  test("keeps every checkbox enabled below the limit", () => {
    const rows = careerRows(12);
    const markup = renderDetails("selected", rows, ["1", "2"]);

    expect(countDisabled(markup)).toBe(0);
  });

  test("shows no limit notice for 10 careers or fewer", () => {
    const rows = careerRows(10);
    const markup = renderDetails(
      "selected",
      rows,
      rows.map((row) => row.id),
    );

    expect(markup).not.toContain("최대 10건까지 선택할 수 있습니다.");
    expect(countDisabled(markup)).toBe(0);
  });

  test("blocks 전체 발급 with an alert when there are more than 10 careers", () => {
    const markup = renderDetails("all", careerRows(11), []);

    expect(markup).toContain('role="alert"');
    expect(markup).toContain("경력이 10건을 넘어 전체 발급할 수 없습니다.");
    expect(markup).toContain("선택 발급으로 10건 이하를 골라주세요.");
  });

  test("shows no alert for 전체 발급 with 10 careers", () => {
    const markup = renderDetails("all", careerRows(10), []);

    expect(markup).not.toContain('role="alert"');
  });
});
