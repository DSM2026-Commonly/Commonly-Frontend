import { Button } from "krds-react";
import DetailsStep from "../steps/DetailsStep";
import { FlowError } from "../CareerCertificateIssue.styles";
import type {
  CertificateCareerRow,
  CertificateIssueType,
} from "../CareerCertificateIssue.types";
import {
  CivilActionRow,
  CivilApplicationPage,
  CivilPageTitle,
  GuideBody,
  GuideCard,
  GuideDivider,
  GuideHeader,
  GuideIcon,
  GuideList,
  GuideTitle,
} from "./CivilCertificateApplicationView.styles";

interface CivilCertificateApplicationViewProps {
  issueType: CertificateIssueType;
  careerRows: readonly CertificateCareerRow[];
  selectedCareerIds: string[];
  isLoadingCareerRows?: boolean;
  loadError?: string;
  canContinue: boolean;
  purpose: string;
  onIssueTypeChange: (issueType: CertificateIssueType) => void;
  onCareerSelection: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onPurposeChange: (value: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

function CivilCertificateApplicationView({
  issueType,
  careerRows,
  selectedCareerIds,
  isLoadingCareerRows = false,
  loadError = "",
  canContinue,
  purpose,
  onIssueTypeChange,
  onCareerSelection,
  onSelectAll,
  onPurposeChange,
  onPrevious,
  onNext,
}: CivilCertificateApplicationViewProps) {
  return (
    <CivilApplicationPage>
      <CivilPageTitle>경력증명서 발급 신청</CivilPageTitle>

      <GuideCard>
        <GuideHeader>
          <GuideTitle>
            <GuideIcon aria-hidden="true">
              <svg viewBox="0 0 32 32">
                <path d="M8 6.5h13.5v3H8zM8 13.5h9v3H8zM8 20.5h8v3H8z" />
                <path d="m18.5 20.5 3 3 5.5-7" />
              </svg>
            </GuideIcon>
            시작하기 전에
          </GuideTitle>
          <p>인터넷 신청은 본인만 가능하며 무료로 발급받을 수 있습니다.</p>
        </GuideHeader>
        <GuideDivider />
        <GuideBody>
          <p>다음 중 해당하는 사항이 있는 경우 042-611-2114로 문의해주세요.</p>
          <GuideList>
            <li>근로 내역이 조회되지 않는 경우</li>
            <li>근로 내역 또는 개인 정보에 오류가 있는 경우</li>
          </GuideList>
        </GuideBody>
      </GuideCard>

      <DetailsStep
        variant="civil"
        issueType={issueType}
        careerRows={careerRows}
        selectedCareerIds={selectedCareerIds}
        isLoadingCareerRows={isLoadingCareerRows}
        additionalNote=""
        purpose={purpose}
        onIssueTypeChange={onIssueTypeChange}
        onCareerSelection={onCareerSelection}
        onSelectAll={onSelectAll}
        onAdditionalNoteChange={() => undefined}
        onPurposeChange={onPurposeChange}
      />

      {loadError && <FlowError role="alert">{loadError}</FlowError>}

      <CivilActionRow>
        {issueType === "selected" && (
          <Button variant="tertiary" size="xlarge" onClick={onPrevious}>
            이전으로
          </Button>
        )}
        <Button size="xlarge" disabled={!canContinue} onClick={onNext}>
          신청하기
        </Button>
      </CivilActionRow>
    </CivilApplicationPage>
  );
}

export default CivilCertificateApplicationView;
