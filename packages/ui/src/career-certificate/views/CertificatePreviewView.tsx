import { Button } from "krds-react";
import certificatePreview from "../../assets/career-certificate-preview.png";
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
  onPrevious: () => void;
  onNext: () => void;
}

function CertificatePreviewView({
  variant = "staff",
  onPrevious,
  onNext,
}: CertificatePreviewViewProps) {
  const isCivil = variant === "civil";

  return (
    <PreviewPage $civil={isCivil}>
      <PreviewHeader>
        <PreviewTitle>경력증명서 발급 미리보기</PreviewTitle>
        <Button size="xlarge" onClick={onNext}>
          다음으로
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
      <PreviewActions>
        <Button variant="tertiary" size="xlarge" onClick={onPrevious}>
          이전으로
        </Button>
        <Button size="xlarge" onClick={onNext}>
          다음으로
        </Button>
      </PreviewActions>
    </PreviewPage>
  );
}

export default CertificatePreviewView;
