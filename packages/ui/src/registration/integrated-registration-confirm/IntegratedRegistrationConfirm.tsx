import "krds-react/dist/index.css";

import { useId, useMemo, useState } from "react";
import {
  Button,
  Select,
  StepIndicator,
} from "krds-react";
import {
  ActionBar,
  ButtonGroup,
  ConfirmCard,
  ConfirmRoot,
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
  StyledSelect,
} from "./integratedRegistrationConfirm.styles";

export interface IntegratedRegistrationConfirmStep {
  id: string;
  title: string;
}

export interface IntegratedRegistrationConfirmField {
  id: string;
  label: string;
}

export interface IntegratedRegistrationConfirmMapping {
  fieldId: string;
  selectedRow: string;
}

export interface IntegratedRegistrationConfirmProps {
  title?: string;
  steps?: readonly IntegratedRegistrationConfirmStep[];
  currentStep?: number;
  stepLabel?: string;
  stepTitle?: string;
  fields?: readonly IntegratedRegistrationConfirmField[];
  rowOptions?: readonly string[];
  previousLabel?: string;
  nextLabel?: string;
  onPrevious?: () => void;
  onNext?: (mappings: IntegratedRegistrationConfirmMapping[]) => void;
}

const defaultSteps = [
  { id: "notice", title: "유의사항 확인" },
  { id: "upload", title: "파일 업로드" },
  { id: "confirm", title: "데이터 확인" },
] as const satisfies readonly IntegratedRegistrationConfirmStep[];

const defaultFields = [
  { id: "name", label: "이름" },
  { id: "gender", label: "성별" },
  { id: "birthDate", label: "생년\n월일" },
  { id: "address", label: "주소" },
  { id: "jobType", label: "직종" },
  { id: "task", label: "담당\n업무" },
  { id: "department", label: "부서" },
  { id: "retirementReason", label: "퇴직\n사유" },
  { id: "workStartDate", label: "근무\n시작" },
  { id: "workEndDate", label: "근무\n종료" },
] as const satisfies readonly IntegratedRegistrationConfirmField[];

const defaultRowOptions = [
  "행 선택",
  "1행",
  "2행",
  "3행",
  "4행",
  "5행",
  "6행",
  "7행",
  "8행",
  "9행",
  "10행",
] as const;

function IntegratedRegistrationConfirm({
  title = "경력사항 통합 등록",
  steps = defaultSteps,
  currentStep = 2,
  stepLabel = "3단계 / 3단계",
  stepTitle = "데이터 확인",
  fields = defaultFields,
  rowOptions = defaultRowOptions,
  previousLabel = "이전으로",
  nextLabel = "다음으로",
  onPrevious,
  onNext,
}: IntegratedRegistrationConfirmProps) {
  const titleId = useId();
  const [selectedRows, setSelectedRows] = useState<Record<string, string>>({});

  const selectOptions = useMemo(
    () =>
      rowOptions.map((option, index) => ({
        value: index === 0 ? "" : option,
        label: option,
      })),
    [rowOptions],
  );

  const selectedRowValues = useMemo(
    () => new Set(Object.values(selectedRows).filter(Boolean)),
    [selectedRows],
  );

  const canProceed =
    fields.length > 0 &&
    fields.every((field) => Boolean(selectedRows[field.id])) &&
    Boolean(onNext);

  const getAvailableOptions = (fieldId: string) => {
    const currentValue = selectedRows[fieldId] ?? "";

    return selectOptions.filter(
      (option) =>
        !option.value ||
        option.value === currentValue ||
        !selectedRowValues.has(option.value),
    );
  };

  const handleSelect = (fieldId: string, value: string) => {
    setSelectedRows((currentRows) => {
      const isSelectedByOtherField = Object.entries(currentRows).some(
        ([selectedFieldId, selectedValue]) =>
          selectedFieldId !== fieldId && selectedValue === value,
      );

      if (value && isSelectedByOtherField) {
        return currentRows;
      }

      return {
        ...currentRows,
        [fieldId]: value,
      };
    });
  };

  const handleNext = () => {
    if (!canProceed) {
      return;
    }

    onNext?.(
      fields.map((field) => ({
        fieldId: field.id,
        selectedRow: selectedRows[field.id] ?? "",
      })),
    );
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
          <ConfirmCard>
            <FieldGrid>
              {fields.map((field) => (
                <FieldRow key={field.id}>
                  <FieldLabel htmlFor={`${titleId}-${field.id}`}>
                    {field.label}
                  </FieldLabel>
                  <StyledSelect>
                    <Select
                      id={`${titleId}-${field.id}`}
                      size="large"
                      options={getAvailableOptions(field.id)}
                      value={selectedRows[field.id] ?? ""}
                      onChange={(value) => handleSelect(field.id, value)}
                      aria-label={`${field.label.replace("\n", " ")} 행 선택`}
                    />
                  </StyledSelect>
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

export default IntegratedRegistrationConfirm;
