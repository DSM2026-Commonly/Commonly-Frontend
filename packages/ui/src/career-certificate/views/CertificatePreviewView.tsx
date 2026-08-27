import { Button } from "krds-react";
import { FlowError } from "../CareerCertificateIssue.styles";
import type {
  CareerCertificateIssueVariant,
  CertificateCareerRow,
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
  PreviewActions,
  PreviewHeader,
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
  isSubmitting?: boolean;
  submissionError?: string;
  onPrevious: () => void;
  onNext: () => void;
}

const ISSUER_NAME = "유성구청";

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
  isSubmitting = false,
  submissionError = "",
  onPrevious,
  onNext,
}: CertificatePreviewViewProps) {
  const isCivil = variant === "civil";
  const nextLabel = isSubmitting ? "발급 중..." : "다음으로";
  const issueDate = formatIssueDate(new Date());

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
      {submissionError && (
        <FlowError role="alert">{submissionError}</FlowError>
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
