import { Button } from "krds-react";
import { FlowError } from "../CareerCertificateIssue.styles";
import {
  SuccessActions,
  SuccessPage,
  SuccessTitle,
  SummaryCard,
  SummaryLabel,
  SummaryValue,
} from "./CertificateSuccessView.styles";
import type {
  CareerCertificateIssueVariant,
  CertificateIssueType,
} from "../CareerCertificateIssue.types";

interface CertificateSuccessViewProps {
  variant?: CareerCertificateIssueVariant;
  issueType: CertificateIssueType;
  applicantName?: string;
  /** 서버가 채번한 문서번호. 비어 있으면 표시하지 않는다. */
  documentNo?: string;
  /** 발급 시각(ISO LocalDateTime). 비어 있으면 표시하지 않는다. */
  issuedAt?: string;
  isDownloading?: boolean;
  downloadError?: string;
  onRestart: () => void;
  onDownload: () => void;
}

/** "2026-09-05T14:03:11" 형태의 발급 시각을 "2026.09.05" 로 줄인다. */
function formatIssuedDate(issuedAt: string): string {
  const datePart = issuedAt.slice(0, 10);

  return /^\d{4}-\d{2}-\d{2}$/.test(datePart)
    ? datePart.replace(/-/g, ".")
    : "";
}

function CertificateSuccessView({
  variant = "staff",
  issueType,
  applicantName = "",
  documentNo = "",
  issuedAt = "",
  isDownloading = false,
  downloadError = "",
  onRestart,
  onDownload,
}: CertificateSuccessViewProps) {
  const isCivil = variant === "civil";
  const issuedDate = formatIssuedDate(issuedAt);

  return (
    <SuccessPage>
      <SuccessTitle>
        {isCivil ? (
          <>
            경력증명서 발급 신청
            <br />
            민원 처리가 완료되었습니다.
          </>
        ) : (
          <>
            경력증명서 발급
            <br />
            업무 처리가 <strong>완료</strong>되었습니다.
          </>
        )}
      </SuccessTitle>
      <SummaryCard>
        <SummaryLabel>{isCivil ? "신청인" : "대상자"}</SummaryLabel>
        <SummaryValue>{applicantName || "-"}</SummaryValue>
        <SummaryLabel>신청정보</SummaryLabel>
        <SummaryValue>
          <p>유성 구청 기간제 근로자 경력증명서 발급 신청</p>
          <p>{issueType === "all" ? "전체 발급" : "선택 발급"}</p>
        </SummaryValue>
        {documentNo && (
          <>
            <SummaryLabel>문서번호</SummaryLabel>
            <SummaryValue>{documentNo}</SummaryValue>
          </>
        )}
        {issuedDate && (
          <>
            <SummaryLabel>발급일</SummaryLabel>
            <SummaryValue>{issuedDate}</SummaryValue>
          </>
        )}
      </SummaryCard>
      {downloadError && <FlowError role="alert">{downloadError}</FlowError>}
      <SuccessActions>
        <Button variant="tertiary" size="xlarge" onClick={onRestart}>
          추가 발급하기
        </Button>
        <Button size="xlarge" disabled={isDownloading} onClick={onDownload}>
          {isDownloading ? "다운로드 중..." : "경력증명서 다운로드"}
        </Button>
      </SuccessActions>
    </SuccessPage>
  );
}

export default CertificateSuccessView;
