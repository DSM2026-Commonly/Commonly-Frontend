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

describe("CertificatePreviewView 서버 미리보기", () => {
  const FALLBACK_NOTICE = "서버 미리보기를 불러오지 못해 입력값으로 구성한 화면입니다.";
  const pdf = new Blob([new Uint8Array([0x25, 0x50, 0x44, 0x46])], {
    type: "application/pdf",
  });

  function renderPreview(
    previewPdf?: Parameters<typeof CertificatePreviewView>[0]["previewPdf"],
  ) {
    return renderToStaticMarkup(
      <CertificatePreviewView
        applicantName="홍길동"
        careerRows={[
          {
            id: "1",
            job: "민원 응대",
            department: "총무과",
            period: "2020-03-01 ~ 현재",
          },
        ]}
        purpose="은행 제출용"
        previewPdf={previewPdf}
        onPrevious={noop}
        onNext={noop}
      />,
    );
  }

  test("renders the server PDF in a titled iframe instead of the drawn sheet", () => {
    const markup = renderPreview({ status: "ready", pdf });

    expect(markup).toContain("<iframe");
    expect(markup).toContain('title="경력증명서 발급 미리보기"');
    expect(markup).not.toContain("경 력 증 명 서");
    expect(markup).not.toContain(FALLBACK_NOTICE);
    // 상단 다음으로·파일명 바는 그대로다.
    expect(markup).toContain("다음으로");
    expect(markup).toContain("유성구청_홍길동_경력증명서.pdf");
  });

  test("shows a loading status while the PDF is being fetched", () => {
    const markup = renderPreview({ status: "loading" });

    expect(markup).toContain('role="status"');
    expect(markup).toContain("미리보기를 불러오는 중입니다.");
    expect(markup).not.toContain("<iframe");
    expect(markup).not.toContain("경 력 증 명 서");
  });

  test("falls back to the drawn sheet with a notice when the PDF fails", () => {
    const markup = renderPreview({ status: "failed" });

    expect(markup).toContain(FALLBACK_NOTICE);
    expect(markup).toContain("경 력 증 명 서");
    expect(markup).toContain("민원 응대");
    expect(markup).toContain("은행 제출용");
    expect(markup).not.toContain("<iframe");
  });

  test("keeps the drawn sheet without a notice when no server preview is wired", () => {
    for (const markup of [renderPreview(), renderPreview({ status: "idle" })]) {
      expect(markup).toContain("경 력 증 명 서");
      expect(markup).not.toContain(FALLBACK_NOTICE);
      expect(markup).not.toContain("<iframe");
    }
  });

  test("still shows the submission error above a server PDF", () => {
    const markup = renderToStaticMarkup(
      <CertificatePreviewView
        previewPdf={{ status: "ready", pdf }}
        submissionError={SUBMISSION_ERROR}
        onPrevious={noop}
        onNext={noop}
      />,
    );

    expect(markup.indexOf(SUBMISSION_ERROR)).toBeGreaterThan(-1);
    expect(markup.indexOf(SUBMISSION_ERROR)).toBeLessThan(
      markup.indexOf("<iframe"),
    );
  });
});
