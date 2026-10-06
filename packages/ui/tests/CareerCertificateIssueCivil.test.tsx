import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import DetailsStep from "../src/career-certificate/steps/DetailsStep";

const noop = () => undefined;

describe("DetailsStep (민원인 본인 발급)", () => {
  // 본인 경력 목록 조회가 막혀 있으면(본인 발급 비활성) 목록이 비어 있다.
  // 표를 지우는 대신 왜 비었는지 안내한다. 발급도 같은 이유로 막히므로 "전체 발급된다"고 약속하지 않는다.
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
    expect(markup).toContain("현재 온라인으로 본인 경력을 조회할 수 없습니다");
    expect(markup).not.toContain("아직 제공되지 않습니다");
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

describe("DetailsStep 민원인 빈 목록 안내", () => {
  const render = (
    ownCareerLoadStatus: "loading" | "loaded" | "unavailable" | "failed",
  ) =>
    renderToStaticMarkup(
      <DetailsStep
        variant="civil"
        issueType="selected"
        selectedCareerIds={[]}
        ownCareerLoadStatus={ownCareerLoadStatus}
        additionalNote=""
        purpose=""
        onIssueTypeChange={noop}
        onCareerSelection={noop}
        onSelectAll={noop}
        onAdditionalNoteChange={noop}
        onPurposeChange={noop}
      />,
    );

  test("tells the user online lookup is closed when the server refuses", () => {
    expect(render("unavailable")).toContain(
      "현재 온라인으로 본인 경력을 조회할 수 없습니다",
    );
  });

  test("asks to retry when the lookup failed for another reason", () => {
    expect(render("failed")).toContain("본인 경력 목록을 불러오지 못했습니다");
  });

  test("says there is no career when the lookup succeeded with zero rows", () => {
    expect(render("loaded")).toContain("조회된 본인 경력이 없습니다");
  });

  test("shows the loading text while the lookup is running", () => {
    expect(render("loading")).toContain("경력 사항을 불러오는 중입니다");
  });
});
