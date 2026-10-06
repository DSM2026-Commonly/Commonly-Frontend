import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import CertificateSuccessView from "../src/career-certificate/views/CertificateSuccessView";

const noop = () => undefined;

function renderSuccess(
  variant: "staff" | "civil",
  issueType: "all" | "selected",
) {
  return renderToStaticMarkup(
    <CertificateSuccessView
      variant={variant}
      issueType={issueType}
      onRestart={noop}
      onDownload={noop}
    />,
  );
}

describe("CertificateSuccessView 발급 구분", () => {
  // 본인 발급도 고른 경력을 실제로 보내면 선택 발급이다.
  test("shows 선택 발급 for a 민원인 who sent the chosen careers", () => {
    const markup = renderSuccess("civil", "selected");

    expect(markup).toContain("선택 발급");
    expect(markup).not.toContain("전체 발급");
  });

  test("shows 전체 발급 for a 민원인 who sent no career ids", () => {
    const markup = renderSuccess("civil", "all");

    expect(markup).toContain("전체 발급");
    expect(markup).not.toContain("선택 발급");
  });

  test("keeps the staff label tied to the issue type", () => {
    expect(renderSuccess("staff", "selected")).toContain("선택 발급");
    expect(renderSuccess("staff", "all")).toContain("전체 발급");
  });
});
