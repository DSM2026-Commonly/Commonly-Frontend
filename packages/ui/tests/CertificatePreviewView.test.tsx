import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import CertificatePreviewView from "../src/career-certificate/views/CertificatePreviewView";

const noop = () => undefined;
/** 입력값으로 그린 서식에만 있는 문구. */
const DRAWN_SHEET_MARKER = "위와 같이 재직ㆍ경력을 증명합니다.";

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
      markup.indexOf(DRAWN_SHEET_MARKER),
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
    expect(markup).toContain(DRAWN_SHEET_MARKER);
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
    expect(markup).not.toContain(DRAWN_SHEET_MARKER);
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
    expect(markup).not.toContain(DRAWN_SHEET_MARKER);
  });

  test("falls back to the drawn sheet with a notice when the PDF fails", () => {
    const markup = renderPreview({ status: "failed" });

    expect(markup).toContain(FALLBACK_NOTICE);
    expect(markup).toContain(DRAWN_SHEET_MARKER);
    expect(markup).toContain("민원 응대");
    expect(markup).toContain("은행 제출용");
    expect(markup).not.toContain("<iframe");
  });

  test("keeps the drawn sheet without a notice when no server preview is wired", () => {
    for (const markup of [renderPreview(), renderPreview({ status: "idle" })]) {
      expect(markup).toContain(DRAWN_SHEET_MARKER);
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

describe("CertificatePreviewView 새 경력증명서 서식", () => {
  // 서버 PDF(백엔드 CertificatePdfRenderer)와 같은 배치·값으로 그려야 민원인이 보는 미리보기와 발급본이 같다.
  test("draws the fallback sheet in the new certificate form", () => {
    const markup = renderToStaticMarkup(
      <CertificatePreviewView
        applicantName="홍길동"
        birthDate="1990.01.01."
        address="대전광역시 유성구 대학로 211"
        careerRows={[
          {
            id: "1",
            job: "민원 응대",
            department: "총무과",
            period: "2020-03-01 ~ 2020-03-30",
            startDate: "2020-03-01",
            endDate: "2020-03-30",
            reason: "계약만료",
          },
          {
            id: "2",
            job: "자료 정리",
            department: "민원과",
            period: "2021-01-01 ~ 현재",
            startDate: "2021-01-01",
            endDate: "",
            reason: "",
          },
        ]}
        purpose="은행 제출용"
        additionalNote="없음"
        onPrevious={noop}
        onNext={noop}
      />,
    );

    expect(markup).toContain("제 미리보기 호");
    expect(markup).toContain("담 당 자 :");
    expect(markup).toContain("(한글) 홍길동");
    expect(markup).toContain("1990.01.01.");
    expect(markup).toContain("대전광역시 유성구 대학로 211");
    expect(markup).toContain("2020.03.01.");
    expect(markup).toContain("2020.03.30.");
    // 30일 근무 + 재직 중(종료일 없음)은 0일 → 1개월 0일
    expect(markup).toContain("총 1 개월 0 일");
    // 퇴직사유는 마지막 이력의 사유만 찍는다(마지막 이력은 사유가 비어 있다).
    expect(markup).not.toContain("계약만료");
    expect(markup).toContain(DRAWN_SHEET_MARKER);
    expect(markup).toContain("대전광역시 유성구청장 (인)");
    // 재직사항 표는 10행 고정이다.
    expect(markup.match(/<tr class="work"/g)).toHaveLength(10);
  });
});

