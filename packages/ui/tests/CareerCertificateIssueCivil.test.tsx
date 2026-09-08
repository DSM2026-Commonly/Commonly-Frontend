import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import DetailsStep from "../src/career-certificate/steps/DetailsStep";

const noop = () => undefined;

describe("DetailsStep (민원인 본인 발급)", () => {
  // 본인 경력 목록 조회 API 가 명세에 없어 목록은 항상 비어 있다.
  // 표를 지우는 대신 전체 경력으로 발급된다는 안내를 남긴다.
  test("shows why the career list is empty for 민원인", () => {
    const markup = renderToStaticMarkup(
      <DetailsStep
        variant="civil"
        issueType="selected"
        selectedCareerIds={[]}
        additionalNote=""
        purpose=""
        onIssueTypeChange={noop}
        onCareerSelection={noop}
        onSelectAll={noop}
        onAdditionalNoteChange={noop}
        onPurposeChange={noop}
      />,
    );

    expect(markup).toContain("전체 발급");
    expect(markup).toContain("선택 발급");
    expect(markup).toContain("본인 경력 목록 조회는 아직 제공되지 않습니다");
    expect(markup).not.toContain("조회된 경력 사항이 없습니다");
  });

  test("keeps the staff empty message unchanged", () => {
    const markup = renderToStaticMarkup(
      <DetailsStep
        issueType="selected"
        selectedCareerIds={[]}
        additionalNote=""
        purpose=""
        onIssueTypeChange={noop}
        onCareerSelection={noop}
        onSelectAll={noop}
        onAdditionalNoteChange={noop}
        onPurposeChange={noop}
      />,
    );

    expect(markup).toContain("조회된 경력 사항이 없습니다");
  });
});
