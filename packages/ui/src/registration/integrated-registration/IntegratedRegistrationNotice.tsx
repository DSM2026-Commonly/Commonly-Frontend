import "krds-react/dist/index.css";

import { useId, useState } from "react";
import {
  Button,
  Checkbox,
  StepIndicator,
} from "krds-react";
import bookIcon from "../../assets/[U-regi-02] 통합 등록 페이지 - 1/icon/book.svg";
import guideCheckIcon from "../../assets/guide_check.svg";
import {
  ActionBar,
  ButtonGroup,
  FormFlow,
  FormMainContent,
  GuideBody,
  GuideCard,
  GuideIcon,
  GuideTitle,
  AgreementBand,
  NoticeHeading,
  PageHeader,
  PageTitle,
  RegistrationNoticeRoot,
  StepCurrentText,
  StepEyebrow,
  StepHeader,
  StepTitle,
  StyledStepIndicator,
  StyledTextList,
} from "./integratedRegistrationNotice.styles";

export interface IntegratedRegistrationNoticeStep {
  id: string;
  title: string;
}

export interface IntegratedRegistrationNoticeProps {
  variant?: "bulk" | "individual";
  title?: string;
  steps?: readonly IntegratedRegistrationNoticeStep[];
  currentStep?: number;
  stepLabel?: string;
  stepTitle?: string;
  guideTitle?: string;
  guideDescription?: string;
  noticeTitle?: string;
  noticeItems?: readonly string[];
  agreementLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  onPrevious?: () => void;
  onNext?: () => void;
}

const defaultSteps = [
  { id: "notice", title: "유의사항 확인" },
  { id: "upload", title: "파일 업로드" },
  { id: "confirm", title: "데이터 확인" },
] as const satisfies readonly IntegratedRegistrationNoticeStep[];

const defaultNoticeItems = [
  "등록 대상자의 인적사항이 일치하는지 확인하여 주시기 바랍니다.",
  "근무기간, 소속부서 및 담당업무를 정확하게 입력하여 주시기 바랍니다.",
  "등록 완료 전 입력 내용을 다시 한번 확인하여 주시기 바랍니다.",
] as const;

function IntegratedRegistrationNotice({
  variant = "bulk",
  title = "경력사항 통합 등록",
  steps = defaultSteps,
  currentStep = 0,
  stepLabel = "1단계 / 3단계",
  stepTitle = "유의사항 확인",
  guideTitle = "시작하기 전에",
  guideDescription = "정확한 인사기록 관리를 위해 등록 및 수정 내역은 모두 시스템에 기록됩니다.\n경력사항은 확인된 자료를 바탕으로 정확하게 등록하여 주시기 바랍니다",
  noticeTitle = "다음 사항을 유의하여 주시기 바랍니다.",
  noticeItems = defaultNoticeItems,
  agreementLabel = "위 유의 사항을 읽고 이해하였습니다.",
  previousLabel = "이전으로",
  nextLabel = "다음으로",
  onPrevious,
  onNext,
}: IntegratedRegistrationNoticeProps) {
  const titleId = useId();
  const agreementId = useId();
  const [isAgreed, setIsAgreed] = useState(false);
  const canProceed = isAgreed && Boolean(onNext);

  const handleNext = () => {
    if (!canProceed) {
      return;
    }

    onNext?.();
  };

  return (
    <RegistrationNoticeRoot
      aria-labelledby={titleId}
      $individual={variant === "individual"}
    >
      <PageHeader>
        <PageTitle id={titleId}>{title}</PageTitle>
        <StyledStepIndicator>
          <StepIndicator
            steps={steps.map((step, index) => ({
              id: step.id,
              step: `${index + 1}단계`,
              title: step.title,
            }))}
            currentStep={currentStep}
            currentStepText="현재 단계"
          />
        </StyledStepIndicator>
      </PageHeader>

      <FormFlow $individual={variant === "individual"}>
        <StepHeader>
          <StepEyebrow>
            <StepCurrentText>{stepLabel.split(" / ")[0]}</StepCurrentText>
            {stepLabel.includes(" / ") ? ` / ${stepLabel.split(" / ")[1]}` : ""}
          </StepEyebrow>
          <StepTitle>{stepTitle}</StepTitle>
        </StepHeader>

        <FormMainContent>
          <GuideCard>
            <GuideTitle>
              <GuideIcon
                src={variant === "individual" ? guideCheckIcon : bookIcon}
                alt=""
                aria-hidden="true"
              />
              {guideTitle}
            </GuideTitle>
            <GuideBody>{guideDescription}</GuideBody>
          </GuideCard>

          <section aria-labelledby="integrated-registration-notice-title">
            <NoticeHeading id="integrated-registration-notice-title">
              {noticeTitle}
            </NoticeHeading>
            <StyledTextList type="decimal">
              {noticeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </StyledTextList>
          </section>

          <AgreementBand>
            <Checkbox
              id={agreementId}
              size="medium"
              label={agreementLabel}
              checked={isAgreed}
              onChange={(event) => setIsAgreed(event.target.checked)}
            />
          </AgreementBand>
        </FormMainContent>

        <ActionBar $individual={variant === "individual"}>
          <ButtonGroup $individual={variant === "individual"}>
            <Button
              variant={variant === "individual" ? "tertiary" : "secondary"}
              size="xlarge"
              type="button"
              onClick={onPrevious}
            >
              {previousLabel}
            </Button>
          </ButtonGroup>
          <ButtonGroup $individual={variant === "individual"}>
            <Button
              variant="primary"
              size="xlarge"
              type="button"
              disabled={!canProceed}
              onClick={handleNext}
            >
              {nextLabel}
            </Button>
          </ButtonGroup>
        </ActionBar>
      </FormFlow>
    </RegistrationNoticeRoot>
  );
}

export default IntegratedRegistrationNotice;
