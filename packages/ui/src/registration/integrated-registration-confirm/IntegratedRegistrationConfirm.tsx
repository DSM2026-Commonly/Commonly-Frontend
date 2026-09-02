import "krds-react/dist/index.css";

import { CERTIFICATE_TARGET_FIELDS } from "@commonly/utils";
import { useId, useMemo, useState } from "react";
import { Button, Select, StepIndicator } from "krds-react";
import {
  ActionBar,
  ButtonGroup,
  ConfirmCard,
  ConfirmRoot,
  FieldGrid,
  FieldLabel,
  FieldRow,
  FormError,
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
  /** 매핑이 반드시 필요한 필드인지. 생략하면 선택 필드로 취급한다. */
  required?: boolean;
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
  /** 첫 항목은 "열 선택" 같은 플레이스홀더로 취급한다. */
  rowOptions: readonly string[];
  /** `fieldId -> rowOption` 형태의 초기 선택값 (예: 열 이름 자동 매칭 결과) */
  initialSelections?: Readonly<Record<string, string>>;
  /** 제출 중이면 버튼을 잠근다. */
  isSubmitting?: boolean;
  submittingLabel?: string;
  /** 제출 실패 등 사용자에게 보여줄 오류 메시지 */
  errorMessage?: string;
  previousLabel?: string;
  nextLabel?: string;
  onPrevious?: () => void;
  onNext?: (
    mappings: IntegratedRegistrationConfirmMapping[],
  ) => void | Promise<void>;
}

const defaultSteps = [
  { id: "notice", title: "유의사항 확인" },
  { id: "upload", title: "파일 업로드" },
  { id: "confirm", title: "데이터 확인" },
] as const satisfies readonly IntegratedRegistrationConfirmStep[];

// 성명·생년월일·채용일은 경력 데이터 식별에 필요한 최소 필드라 매핑을 강제하고,
// 나머지는 파일에 해당 열이 없어도 등록할 수 있도록 선택 필드로 둔다.
const REQUIRED_FIELD_IDS = new Set<string>(["name", "birthDate", "hireDate"]);

// 좁은 라벨 칸에 맞추기 위해 긴 라벨은 줄바꿈해서 표시한다.
const LABEL_OVERRIDES: Readonly<Record<string, string>> = {
  birthDate: "생년\n월일",
  keyResponsibilities: "담당\n업무",
  expirationDate: "만료\n예정일",
  employmentType: "근무\n형태",
};

// 매핑 대상 필드 목록은 @commonly/utils 의 CERTIFICATE_TARGET_FIELDS 를 단일 소스로 쓴다.
const defaultFields: readonly IntegratedRegistrationConfirmField[] =
  CERTIFICATE_TARGET_FIELDS.map((field) => ({
    id: field.id,
    label: LABEL_OVERRIDES[field.id] ?? field.label,
    required: REQUIRED_FIELD_IDS.has(field.id),
  }));

function IntegratedRegistrationConfirm({
  title = "경력사항 통합 등록",
  steps = defaultSteps,
  currentStep = 2,
  stepLabel = "3단계 / 3단계",
  stepTitle = "데이터 확인",
  fields = defaultFields,
  rowOptions,
  initialSelections,
  isSubmitting = false,
  submittingLabel = "등록 중...",
  errorMessage,
  previousLabel = "이전으로",
  nextLabel = "다음으로",
  onPrevious,
  onNext,
}: IntegratedRegistrationConfirmProps) {
  const titleId = useId();
  const [selectedRows, setSelectedRows] = useState<Record<string, string>>(
    () => ({ ...initialSelections }),
  );

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
    fields.every(
      (field) => !field.required || Boolean(selectedRows[field.id]),
    ) &&
    !isSubmitting &&
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

    // 매핑하지 않은 선택 필드는 요청에서 제외한다.
    void onNext?.(
      fields
        .filter((field) => Boolean(selectedRows[field.id]))
        .map((field) => ({
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
                    {field.required && (
                      <span aria-hidden="true" title="필수 매핑 항목">
                        {" *"}
                      </span>
                    )}
                  </FieldLabel>
                  <StyledSelect>
                    <Select
                      id={`${titleId}-${field.id}`}
                      size="large"
                      options={getAvailableOptions(field.id)}
                      value={selectedRows[field.id] ?? ""}
                      onChange={(value) => handleSelect(field.id, value)}
                      aria-label={`${field.label.replace("\n", " ")} 행 선택${field.required ? " (필수)" : ""}`}
                      aria-required={field.required ?? false}
                    />
                  </StyledSelect>
                </FieldRow>
              ))}
            </FieldGrid>
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

export default IntegratedRegistrationConfirm;
