import "krds-react/dist/index.css";

import { useId } from "react";
import { Button, StepIndicator } from "krds-react";
import {
  ActionBar,
  ButtonGroup,
  ConfirmCard,
  ConfirmRoot,
  DisabledValueInput,
  FieldGrid,
  FieldLabel,
  FieldRow,
  FormFlow,
  FormMainContent,
  PageHeader,
  PageTitle,
  StepCurrentText,
  StepEyebrow,
  StepHeader,
  StepTitle,
  StyledStepIndicator,
} from "./integratedRegistrationPreview.styles";

export interface IntegratedRegistrationPreviewStep {
  id: string;
  title: string;
}

export interface IntegratedRegistrationPreviewField {
  id: string;
  label: string;
  value: string;
}

export interface IntegratedRegistrationPreviewProps {
  title?: string;
  steps?: readonly IntegratedRegistrationPreviewStep[];
  currentStep?: number;
  stepLabel?: string;
  stepTitle?: string;
  fields?: readonly IntegratedRegistrationPreviewField[];
  previousLabel?: string;
  nextLabel?: string;
  onPrevious?: () => void;
  onNext?: () => void;
}

const defaultSteps = [
  { id: "notice", title: "유의사항 확인" },
  { id: "upload", title: "파일 업로드" },
  { id: "confirm", title: "데이터 확인" },
] as const satisfies readonly IntegratedRegistrationPreviewStep[];

const defaultFields = [
  { id: "name", label: "이름", value: "홍길동" },
  { id: "gender", label: "성별", value: "남" },
  { id: "birthDate", label: "생년\n월일", value: "090210" },
  { id: "address", label: "주소", value: "대전광역시 서구 둔산로 100" },
  { id: "jobType", label: "직종", value: "사무직" },
  { id: "task", label: "담당\n업무", value: "총무" },
  { id: "department", label: "부서", value: "운영지원팀" },
  { id: "retirementReason", label: "퇴직\n사유", value: "계약만료" },
  { id: "workStartDate", label: "근무\n시작", value: "2021.03.01" },
  { id: "workEndDate", label: "근무\n종료", value: "2024.12.31" },
] as const satisfies readonly IntegratedRegistrationPreviewField[];

function IntegratedRegistrationPreview({
  title = "경력사항 통합 등록",
  steps = defaultSteps,
  currentStep = 2,
  stepLabel = "3단계 / 3단계",
  stepTitle = "예시 데이터 확인",
  fields = defaultFields,
  previousLabel = "이전으로",
  nextLabel = "다음으로",
  onPrevious,
  onNext,
}: IntegratedRegistrationPreviewProps) {
  const titleId = useId();
  const canProceed =
    fields.length > 0 &&
    fields.every((field) => field.value.trim().length > 0) &&
    Boolean(onNext);

  const handleNext = () => {
    if (!canProceed) {
      return;
    }

    onNext?.();
  };

  return (
    <ConfirmRoot aria-labelledby={titleId}>
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

      <FormFlow>
        <StepHeader>
          <StepEyebrow>
            <StepCurrentText>{stepLabel.split(" / ")[0]}</StepCurrentText>
            {stepLabel.includes(" / ") ? ` / ${stepLabel.split(" / ")[1]}` : ""}
          </StepEyebrow>
          <StepTitle>{stepTitle}</StepTitle>
        </StepHeader>

        <FormMainContent>
          <ConfirmCard aria-label={stepTitle}>
            <FieldGrid>
              {fields.map((field) => (
                <FieldRow key={field.id}>
                  <FieldLabel htmlFor={`${titleId}-${field.id}`}>
                    {field.label}
                  </FieldLabel>
                  <DisabledValueInput
                    id={`${titleId}-${field.id}`}
                    value={field.value}
                    size="large"
                    disabled
                    aria-label={`${field.label.replace("\n", " ")} 예시 값`}
                  />
                </FieldRow>
              ))}
            </FieldGrid>
          </ConfirmCard>
        </FormMainContent>

        <ActionBar>
          <ButtonGroup>
            <Button
              variant="secondary"
              size="xlarge"
              type="button"
              onClick={onPrevious}
            >
              {previousLabel}
            </Button>
          </ButtonGroup>
          <ButtonGroup>
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
    </ConfirmRoot>
  );
}

export default IntegratedRegistrationPreview;
