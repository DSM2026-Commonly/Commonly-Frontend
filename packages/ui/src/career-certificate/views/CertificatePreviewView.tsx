import { Button } from "krds-react";
import { useEffect, useRef } from "react";
import { FlowError } from "../CareerCertificateIssue.styles";
import type {
  CareerCertificateIssueVariant,
  CertificateCareerRow,
  CertificatePreviewPdfState,
} from "../CareerCertificateIssue.types";
import {
  DocumentBody,
  DocumentFooter,
  DocumentIssuer,
  DocumentSheet,
  DocumentTable,
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
  birthDate?: string;
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

function formatIssueDate(date: Date): string {
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, "0")}월 ${String(date.getDate()).padStart(2, "0")}일`;
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
  const issueDate = formatIssueDate(new Date());
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
            <DocumentTitle>경 력 증 명 서</DocumentTitle>
            <DocumentBody>
              <DocumentTable>
                <caption className="sr-only">인적사항</caption>
                <tbody>
                  <tr>
                    <th scope="row">성명</th>
                    <td>{applicantName || "-"}</td>
                    <th scope="row">생년월일</th>
                    <td>{birthDate || "-"}</td>
                  </tr>
                </tbody>
              </DocumentTable>

              <DocumentTable>
                <caption className="sr-only">경력사항</caption>
                <thead>
                  <tr>
                    <th scope="col">근무부서</th>
                    <th scope="col">담당업무</th>
                    <th scope="col">근무기간</th>
                  </tr>
                </thead>
                <tbody>
                  {careerRows.length === 0 ? (
                    <tr>
                      <td colSpan={3}>경력 사항이 없습니다.</td>
                    </tr>
                  ) : (
                    careerRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.department}</td>
                        <td>{row.job}</td>
                        <td>{row.period}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </DocumentTable>

              <DocumentTable>
                <caption className="sr-only">발급 정보</caption>
                <tbody>
                  <tr>
                    <th scope="row">용도</th>
                    <td colSpan={3}>{purpose || "-"}</td>
                  </tr>
                  <tr>
                    <th scope="row">그 밖의 사항</th>
                    <td colSpan={3}>{additionalNote || "-"}</td>
                  </tr>
                </tbody>
              </DocumentTable>

              <DocumentFooter>
                <p>위와 같이 근무하였음을 증명합니다.</p>
                <p>{issueDate}</p>
              </DocumentFooter>
              <DocumentIssuer>{ISSUER_NAME}장</DocumentIssuer>
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
