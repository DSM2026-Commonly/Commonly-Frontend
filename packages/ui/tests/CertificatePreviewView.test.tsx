import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import CertificatePreviewView from "../src/career-certificate/views/CertificatePreviewView";

const noop = () => undefined;

const SUBMISSION_ERROR =
  "본인 증명서 발급 권한이 없습니다. 042-611-2114로 문의해 주세요.";

describe("CertificatePreviewView", () => {
  // 문서 미리보기가 화면 몇 배 높이라, 에러를 그 아래에 그리면 뷰포트 밖으로 밀려나
  // 발급이 실패해도 아무 반응이 없는 것처럼 보인다.
  test("renders the submission error above the document preview", () => {
    const markup = renderToStaticMarkup(
      <CertificatePreviewView
        variant="civil"
        applicantName="홍길동"
        submissionError={SUBMISSION_ERROR}
        onPrevious={noop}
        onNext={noop}
      />,
    );

    expect(markup).toContain(SUBMISSION_ERROR);
    expect(markup).toContain('role="alert"');
    expect(markup.indexOf(SUBMISSION_ERROR)).toBeLessThan(
      markup.indexOf("경 력 증 명 서"),
    );
  });

  test("renders no alert without a submission error", () => {
    const markup = renderToStaticMarkup(
      <CertificatePreviewView
        variant="civil"
        applicantName="홍길동"
        onPrevious={noop}
        onNext={noop}
      />,
    );

    expect(markup).not.toContain('role="alert"');
    expect(markup).toContain("경 력 증 명 서");
  });
});
