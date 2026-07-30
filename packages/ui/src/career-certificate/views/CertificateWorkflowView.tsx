import { Button, StepIndicator } from "krds-react";
import type { ReactNode } from "react";
import {
  STEP_INDICATOR_ITEMS,
  STEP_TITLES,
} from "../CareerCertificateIssue.constants";
import {
  ActionRow,
  PageTitle,
  Stage,
  StageContent,
  StageEyebrow,
  StageHeader,
  StageTitle,
  StandardPage,
  StepIndicatorFrame,
  TitleRow,
} from "./CertificateWorkflowView.styles";

interface CertificateWorkflowViewProps {
  currentStep: number;
  canContinue: boolean;
  children: ReactNode;
  onPrevious: () => void;
  onNext: () => void;
}

function CertificateWorkflowView({
  currentStep,
  canContinue,
  children,
  onPrevious,
  onNext,
}: CertificateWorkflowViewProps) {
  return (
    <StandardPage>
      <TitleRow>
        <PageTitle>경력증명서 발급</PageTitle>
        <StepIndicatorFrame>
          <StepIndicator
            steps={STEP_INDICATOR_ITEMS}
            currentStep={currentStep}
            currentStepText="현재 단계"
          />
        </StepIndicatorFrame>
      </TitleRow>

      <Stage>
        <StageHeader>
          <StageEyebrow>
            <strong>{currentStep + 1}단계</strong> / 4단계
          </StageEyebrow>
          <StageTitle>{STEP_TITLES[currentStep]}</StageTitle>
        </StageHeader>
        <StageContent>{children}</StageContent>
        <ActionRow>
          <Button variant="tertiary" size="xlarge" onClick={onPrevious}>
            {currentStep === 0 ? "취소하기" : "이전으로"}
          </Button>
          <Button
            size="xlarge"
            disabled={!canContinue}
            onClick={onNext}
          >
            {currentStep === 3 ? "신청하기" : "다음으로"}
          </Button>
        </ActionRow>
      </Stage>
    </StandardPage>
  );
}

export default CertificateWorkflowView;
