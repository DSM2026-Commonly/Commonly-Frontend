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
  isDownloading?: boolean;
  downloadError?: string;
  onRestart: () => void;
  onDownload: () => void;
}

function CertificateSuccessView({
  variant = "staff",
  issueType,
  applicantName = "",
  isDownloading = false,
  downloadError = "",
  onRestart,
  onDownload,
}: CertificateSuccessViewProps) {
  const isCivil = variant === "civil";

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
