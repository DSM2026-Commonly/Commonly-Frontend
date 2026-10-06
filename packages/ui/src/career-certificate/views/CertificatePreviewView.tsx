import { Button } from "krds-react";
import { useEffect, useRef } from "react";
import { FlowError } from "../CareerCertificateIssue.styles";
import type {
  CareerCertificateIssueVariant,
  CertificateCareerRow,
  CertificatePreviewPdfState,
} from "../CareerCertificateIssue.types";
import {
  CERTIFICATE_WORK_ROWS,
  calculateTotalWorkPeriod,
  formatDocumentDate,
  formatIssuedDate,
  getLastRetirementReason,
} from "../certificateDocument";
import {
  CertificateTable,
  DocumentBody,
  DocumentFooter,
  DocumentHeader,
  DocumentIssuedDate,
  DocumentIssuer,
  DocumentSheet,
  DocumentStatement,
  DocumentTitle,
  DocumentViewer,
  FilenameBar,
  PdfFrame,
  PreviewActions,
  PreviewFallbackNotice,
  PreviewHeader,
  PreviewLoading,
  PreviewPage,
  PreviewTitle,
} from "./CertificatePreviewView.styles";

interface CertificatePreviewViewProps {
  variant?: CareerCertificateIssueVariant;
  applicantName?: string;
  /** 서식 표기(YYYY.MM.DD.)로 찍을 생년월일. */
  birthDate?: string;
  /** 대상자 주소. 민원인은 내 정보에 주소가 없어 비어 있다. */
  address?: string;
  careerRows?: readonly CertificateCareerRow[];
  purpose?: string;
  additionalNote?: string;
  /** 서버 PDF 를 받았으면 그것을 띄우고, 없거나 실패하면 입력값으로 그린 미리보기를 보여준다. */
  previewPdf?: CertificatePreviewPdfState;
  isSubmitting?: boolean;
  submissionError?: string;
  onPrevious: () => void;
  onNext: () => void;
}

const ISSUER_NAME = "유성구청";
/** 서버 PDF 와 같은 발급자 표기. */
const DOCUMENT_ISSUER = "대전광역시 유성구청장 (인)";

/** 서버가 만든 미리보기 PDF. Blob URL 은 PDF 가 바뀌거나 화면을 떠날 때 해제한다. */
function PdfPreviewFrame({ pdf, civil }: { pdf: Blob; civil: boolean }) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(pdf);

    // URL 을 렌더 중에 만들면 StrictMode 의 effect 재실행 때 해제된 URL 이 남으므로 여기서 연결한다.
    if (frameRef.current) {
      frameRef.current.src = url;
    }

    return () => URL.revokeObjectURL(url);
  }, [pdf]);

  return (
    <PdfFrame ref={frameRef} $civil={civil} title="경력증명서 발급 미리보기" />
  );
}

/** 파일명에 쓸 수 없는 문자를 제거한다. 문서번호는 발급 후 부여되므로 파일명에 넣지 않는다. */
function buildPreviewFilename(applicantName: string): string {
  const safeName = applicantName.trim().replace(/[\\/:*?"<>|]/g, "");

  return safeName
    ? `${ISSUER_NAME}_${safeName}_경력증명서.pdf`
    : `${ISSUER_NAME}_경력증명서.pdf`;
}

function CertificatePreviewView({
  variant = "staff",
  applicantName = "",
  birthDate = "",
  address = "",
  careerRows = [],
  purpose = "",
  additionalNote = "",
  previewPdf = { status: "idle" },
  isSubmitting = false,
  submissionError = "",
  onPrevious,
  onNext,
}: CertificatePreviewViewProps) {
  const isCivil = variant === "civil";
  const nextLabel = isSubmitting ? "발급 중..." : "다음으로";
  const issueDate = formatIssuedDate(new Date());
  const totalWorkPeriod = calculateTotalWorkPeriod(careerRows);
  const workRows = Array.from(
    { length: Math.max(CERTIFICATE_WORK_ROWS, careerRows.length) },
    (_, index) => careerRows[index],
  );
  const errorRef = useRef<HTMLParagraphElement>(null);

  // 문서 미리보기가 화면 몇 배 높이라, 어느 '다음으로'를 눌렀든 에러가 화면 밖에 있을 수 있다.
  // 발급이 실패하면 아무 반응이 없는 것처럼 보이므로 에러를 화면 안으로 끌어온다.
  useEffect(() => {
    if (!submissionError) {
      return;
    }

    errorRef.current?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  }, [submissionError]);

  return (
    <PreviewPage $civil={isCivil}>
      <PreviewHeader>
        <PreviewTitle>경력증명서 발급 미리보기</PreviewTitle>
        <Button size="xlarge" disabled={isSubmitting} onClick={onNext}>
          {nextLabel}
        </Button>
      </PreviewHeader>
      <FilenameBar>
        <span>{buildPreviewFilename(applicantName)}</span>
      </FilenameBar>
      {submissionError && (
        <FlowError ref={errorRef} role="alert">
          {submissionError}
        </FlowError>
      )}
      {previewPdf.status === "failed" && (
        <PreviewFallbackNotice>
          서버 미리보기를 불러오지 못해 입력값으로 구성한 화면입니다. 실제
          발급되는 증명서와 다를 수 있습니다.
        </PreviewFallbackNotice>
      )}
      {previewPdf.status === "ready" ? (
        <PdfPreviewFrame pdf={previewPdf.pdf} civil={isCivil} />
      ) : previewPdf.status === "loading" ? (
        <DocumentViewer $civil={isCivil}>
          <PreviewLoading role="status">
            미리보기를 불러오는 중입니다.
          </PreviewLoading>
        </DocumentViewer>
      ) : (
        <DocumentViewer $civil={isCivil}>
          <DocumentSheet
            $civil={isCivil}
            aria-label="열람용 경력증명서 미리보기"
          >
            {/* 서버 PDF(CertificatePdfRenderer)와 같은 「경력증명서 서식」 배치. */}
            <DocumentTitle>경력증명서</DocumentTitle>
            <DocumentBody>
              <DocumentHeader>
                <span />
                <p>담 당 자 :</p>
                <p>제 미리보기 호</p>
                <p>연 락 처 :</p>
              </DocumentHeader>

              <CertificateTable>
                <caption className="sr-only">경력증명서 서식</caption>
                <colgroup>
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "41%" }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td className="label" rowSpan={3}>
                      인적사항
                    </td>
                    <td className="label" rowSpan={2}>
                      성 명
                    </td>
                    <td className="left">(한글) {applicantName}</td>
                    <td className="label" rowSpan={2}>
                      생년월일
                    </td>
                    <td rowSpan={2}>{birthDate}</td>
                  </tr>
                  <tr>
                    <td className="left">(영문)</td>
                  </tr>
                  <tr>
                    <td className="label">주 소</td>
                    <td className="left" colSpan={3}>
                      {address}
                    </td>
                  </tr>
                  <tr>
                    <td className="label" rowSpan={workRows.length + 2}>
                      재직사항
                    </td>
                    <td className="label" colSpan={2}>
                      근무기간
                    </td>
                    <td className="label" rowSpan={2}>
                      근무부서
                    </td>
                    <td className="label" rowSpan={2}>
                      담당업무
                    </td>
                  </tr>
                  <tr>
                    <td className="label">부터</td>
                    <td className="label">까지</td>
                  </tr>
                  {workRows.map((row, index) => (
                    <tr className="work" key={row?.id ?? `empty-${index}`}>
                      <td className="date">{formatDocumentDate(row?.startDate)}</td>
                      <td className="date">{formatDocumentDate(row?.endDate)}</td>
                      <td>{row?.department}</td>
                      <td>{row?.job}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="label">
                      총 근무
                      <br />
                      기간
                    </td>
                    <td className="total" colSpan={2}>
                      총 {totalWorkPeriod.months} 개월 {totalWorkPeriod.days} 일
                    </td>
                    <td className="label">퇴직사유</td>
                    <td>{getLastRetirementReason(careerRows)}</td>
                  </tr>
                  <tr>
                    <td className="label">
                      그 밖의
                      <br />
                      사항
                    </td>
                    <td className="left" colSpan={4}>
                      {additionalNote}
                    </td>
                  </tr>
                  <tr>
                    <td className="label">용 도</td>
                    <td className="left" colSpan={4}>
                      {purpose}
                    </td>
                  </tr>
                </tbody>
              </CertificateTable>

              <DocumentFooter>
                <DocumentStatement>
                  위와 같이 재직ㆍ경력을 증명합니다.
                </DocumentStatement>
                <DocumentIssuedDate>{issueDate}</DocumentIssuedDate>
                <DocumentIssuer>{DOCUMENT_ISSUER}</DocumentIssuer>
              </DocumentFooter>
            </DocumentBody>
          </DocumentSheet>
        </DocumentViewer>
      )}
      <PreviewActions>
        <Button
          variant="tertiary"
          size="xlarge"
          disabled={isSubmitting}
          onClick={onPrevious}
        >
          이전으로
        </Button>
        <Button size="xlarge" disabled={isSubmitting} onClick={onNext}>
          {nextLabel}
        </Button>
      </PreviewActions>
    </PreviewPage>
  );
}

export default CertificatePreviewView;
