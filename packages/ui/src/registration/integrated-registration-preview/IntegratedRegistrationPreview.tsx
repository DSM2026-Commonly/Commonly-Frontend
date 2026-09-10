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
  FormError,
  FormFlow,
  FormMainContent,
  PageHeader,
  PageTitle,
  PreviewBody,
  RowNavigator,
  RowNavigatorButtons,
  RowNavigatorCounter,
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
  fields: readonly IntegratedRegistrationPreviewField[];
  /** 현재 표시 중인 행의 0 기반 위치. `rowCount`·`onRowChange` 와 함께 주면 행 이동 UI를 보여준다. */
  rowIndex?: number;
  /** 미리볼 수 있는 전체 행 수 */
  rowCount?: number;
  onRowChange?: (rowIndex: number) => void;
  /** 제출 중이면 버튼을 잠근다. */
  isSubmitting?: boolean;
  submittingLabel?: string;
  /** 제출 실패 등 사용자에게 보여줄 오류 메시지 */
  errorMessage?: string;
  previousLabel?: string;
  nextLabel?: string;
  onPrevious?: () => void;
  onNext?: () => void | Promise<void>;
}

const defaultSteps = [
  { id: "notice", title: "유의사항 확인" },
  { id: "upload", title: "파일 업로드" },
  { id: "confirm", title: "데이터 확인" },
] as const satisfies readonly IntegratedRegistrationPreviewStep[];

function IntegratedRegistrationPreview({
  title = "경력사항 통합 등록",
  steps = defaultSteps,
  currentStep = 2,
  stepLabel = "3단계 / 3단계",
  stepTitle = "예시 데이터 확인",
  fields,
  rowIndex = 0,
  rowCount = 0,
  onRowChange,
  isSubmitting = false,
  submittingLabel = "등록 중...",
  errorMessage,
  previousLabel = "이전으로",
  nextLabel = "다음으로",
  onPrevious,
  onNext,
}: IntegratedRegistrationPreviewProps) {
  const titleId = useId();
  const canProceed = fields.length > 0 && !isSubmitting && Boolean(onNext);
  const showRowNavigator = rowCount > 0 && Boolean(onRowChange);
  const canGoPrevious = !isSubmitting && rowIndex > 0;
  const canGoNext = !isSubmitting && rowIndex < rowCount - 1;

  const handleNext = () => {
    if (!canProceed) {
      return;
    }

    void onNext?.();
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
            <PreviewBody>
              {showRowNavigator && (
                <RowNavigator>
                  <RowNavigatorCounter aria-live="polite">
                    {rowIndex + 1}행 / 총 {rowCount}행
                  </RowNavigatorCounter>
                  <RowNavigatorButtons>
                    <Button
                      variant="tertiary"
                      size="medium"
                      type="button"
                      disabled={!canGoPrevious}
                      onClick={() => onRowChange?.(rowIndex - 1)}
                    >
                      이전 행
                    </Button>
                    <Button
                      variant="tertiary"
                      size="medium"
                      type="button"
                      disabled={!canGoNext}
                      onClick={() => onRowChange?.(rowIndex + 1)}
                    >
                      다음 행
                    </Button>
                  </RowNavigatorButtons>
                </RowNavigator>
              )}
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
                      aria-label={`${field.label.replace("\n", " ")} 값`}
                    />
                  </FieldRow>
                ))}
              </FieldGrid>
            </PreviewBody>
          </ConfirmCard>
          {errorMessage && <FormError role="alert">{errorMessage}</FormError>}
        </FormMainContent>

        <ActionBar>
          <ButtonGroup>
            <Button
              variant="tertiary"
              size="xlarge"
              type="button"
              disabled={isSubmitting}
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
              {isSubmitting ? submittingLabel : nextLabel}
            </Button>
          </ButtonGroup>
        </ActionBar>
      </FormFlow>
    </ConfirmRoot>
  );
}

export default IntegratedRegistrationPreview;
