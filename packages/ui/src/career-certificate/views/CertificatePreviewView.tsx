import { Button } from "krds-react";
import certificatePreview from "../../assets/career-certificate-preview.png";
import { FlowError } from "../CareerCertificateIssue.styles";
import type { CareerCertificateIssueVariant } from "../CareerCertificateIssue.types";
import {
  CertificateImage,
  DocumentViewer,
  FilenameBar,
  PreviewActions,
  PreviewHeader,
  PreviewPage,
  PreviewTitle,
} from "./CertificatePreviewView.styles";

interface CertificatePreviewViewProps {
  variant?: CareerCertificateIssueVariant;
  isSubmitting?: boolean;
  submissionError?: string;
  onPrevious: () => void;
  onNext: () => void;
}

function CertificatePreviewView({
  variant = "staff",
  isSubmitting = false,
  submissionError = "",
  onPrevious,
  onNext,
}: CertificatePreviewViewProps) {
  const isCivil = variant === "civil";
  const nextLabel = isSubmitting ? "발급 중..." : "다음으로";

  return (
    <PreviewPage $civil={isCivil}>
      <PreviewHeader>
        <PreviewTitle>경력증명서 발급 미리보기</PreviewTitle>
        <Button size="xlarge" disabled={isSubmitting} onClick={onNext}>
          {nextLabel}
        </Button>
      </PreviewHeader>
      <FilenameBar>
        <span>유성구청_홍길동_경력증명서_A2026-001.pdf</span>
      </FilenameBar>
      <DocumentViewer $civil={isCivil}>
        <CertificateImage
          $civil={isCivil}
          src={certificatePreview}
          alt="열람용 경력증명서 미리보기"
        />
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
