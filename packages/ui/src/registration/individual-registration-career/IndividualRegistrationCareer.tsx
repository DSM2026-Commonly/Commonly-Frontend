import "krds-react/dist/index.css";

import { useId, useState, type FormEvent } from "react";
import {
  Button,
  Select,
  StepIndicator,
  Textarea,
  TextInput,
} from "krds-react";
import { YEAR_OPTIONS } from "../../career-certificate/CareerCertificateIssue.constants";
import {
  getDaysInBirthMonth,
  isValidBirthDate,
  isValidBirthDay,
  isValidBirthMonth,
} from "../../career-certificate/CareerCertificateIssue.validation";
import {
  ActionBar,
  ButtonGroup,
  FormFlow,
  IndividualRegistrationSubjectRoot,
  PageHeader,
  PageTitle,
  StepCurrentText,
  StepEyebrow,
  StepHeader,
  StepTitle,
  StyledStepIndicator,
} from "../individual-registration-subject/individualRegistrationSubject.styles";
import {
  CareerCard,
  CareerCardBody,
  CareerCardTitle,
  CareerForm,
  DateFields,
  FieldGroup,
} from "./individualRegistrationCareer.styles";
import { isValidCareerDateRange } from "./IndividualRegistrationCareer.validation";

export interface IndividualRegistrationCareerStep {
  id: string;
  title: string;
}

export interface IndividualRegistrationCareerData {
  jobTitle: string;
  duties: string;
  department: string;
  startYear: string;
  startMonth: string;
  startDay: string;
  endYear: string;
  endMonth: string;
  endDay: string;
  resignationReason: string;
  note: string;
}

export interface IndividualRegistrationCareerProps {
  title?: string;
  steps?: readonly IndividualRegistrationCareerStep[];
  currentStep?: number;
  stepLabel?: string;
  stepTitle?: string;
  previousLabel?: string;
  submitLabel?: string;
  onPrevious?: () => void;
  onSubmit?: (career: IndividualRegistrationCareerData) => void;
}

const defaultSteps = [
  { id: "notice", title: "유의사항 확인" },
  { id: "subject", title: "대상자 입력" },
  { id: "career", title: "경력사항 입력" },
] as const satisfies readonly IndividualRegistrationCareerStep[];

const initialCareer: IndividualRegistrationCareerData = {
  jobTitle: "",
  duties: "",
  department: "",
  startYear: "",
  startMonth: "",
  startDay: "",
  endYear: "",
  endMonth: "",
  endDay: "",
  resignationReason: "",
  note: "",
};

const sanitizeNumber = (value: string, maxLength: number) =>
  value.replace(/\D/g, "").slice(0, maxLength);

const resizeTextarea = (event: FormEvent<HTMLTextAreaElement>) => {
  const textarea = event.currentTarget;

  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
};

function IndividualRegistrationCareer({
  title = "경력사항 개별 등록",
  steps = defaultSteps,
  currentStep = 2,
  stepLabel = "3단계 / 3단계",
  stepTitle = "경력사항 입력",
  previousLabel = "이전으로",
  submitLabel = "등록하기",
  onPrevious,
  onSubmit,
}: IndividualRegistrationCareerProps) {
  const titleId = useId();
  const [career, setCareer] = useState(initialCareer);
  const isStartMonthInvalid =
    career.startMonth.length > 0 && !isValidBirthMonth(career.startMonth);
  const maximumStartDay = getDaysInBirthMonth(
    career.startYear,
    career.startMonth,
  );
  const isStartDayInvalid =
    career.startDay.length > 0 &&
    !isValidBirthDay(career.startYear, career.startMonth, career.startDay);
  const isEndMonthInvalid =
    career.endMonth.length > 0 && !isValidBirthMonth(career.endMonth);
  const maximumEndDay = getDaysInBirthMonth(career.endYear, career.endMonth);
  const isEndDayInvalid =
    career.endDay.length > 0 &&
    !isValidBirthDay(career.endYear, career.endMonth, career.endDay);
  const canSubmit =
    Boolean(career.jobTitle.trim()) &&
    Boolean(career.duties.trim()) &&
    Boolean(career.department.trim()) &&
    isValidBirthDate(
      career.startYear,
      career.startMonth,
      career.startDay,
    ) &&
    isValidBirthDate(career.endYear, career.endMonth, career.endDay) &&
    isValidCareerDateRange(
      career.startYear,
      career.startMonth,
      career.startDay,
      career.endYear,
      career.endMonth,
      career.endDay,
    ) &&
    Boolean(career.resignationReason.trim());

  const updateField = <Key extends keyof IndividualRegistrationCareerData>(
    field: Key,
    value: IndividualRegistrationCareerData[Key],
  ) => {
    setCareer((current) => ({ ...current, [field]: value }));
  };

  const updateDateField = (
    field:
      | "startMonth"
      | "startDay"
      | "endMonth"
      | "endDay",
    value: string,
  ) => {
    updateField(field, sanitizeNumber(value, 2));
  };

  return (
    <IndividualRegistrationSubjectRoot aria-labelledby={titleId}>
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

        <CareerForm
          onSubmit={(event) => {
            event.preventDefault();

            if (!canSubmit) {
              return;
            }

            onSubmit?.(career);
          }}
        >
          <CareerCard>
            <CareerCardTitle>근무 정보 입력</CareerCardTitle>
            <CareerCardBody>
              <FieldGroup>
                    <TextInput
                      id={`${titleId}-job-title`}
                      label="직종명"
                      size="large"
                      placeholder="직종을 입력해주세요"
                      required
                      value={career.jobTitle}
                      onChange={(value) => updateField("jobTitle", value)}
                    />
                    <TextInput
                      id={`${titleId}-duties`}
                      label="담당업무"
                      size="large"
                      placeholder="업무 내용을 입력해주세요"
                      required
                      value={career.duties}
                      onChange={(value) => updateField("duties", value)}
                    />
                    <TextInput
                      id={`${titleId}-department`}
                      label="근무부서"
                      size="large"
                      placeholder="부서를 입력해주세요"
                      required
                      value={career.department}
                      onChange={(value) => updateField("department", value)}
                    />

                    <div>
                      <label htmlFor={`${titleId}-start-year`}>근무 시작일</label>
                      <DateFields>
                        <Select
                          id={`${titleId}-start-year`}
                          size="large"
                          className={career.startYear ? "completed" : undefined}
                          aria-label="근무 시작 연도"
                          options={YEAR_OPTIONS}
                          required
                          value={career.startYear}
                          onChange={(value) => updateField("startYear", value)}
                        />
                        <TextInput
                          id={`${titleId}-start-month`}
                          size="large"
                          aria-label="근무 시작 월"
                          aria-invalid={isStartMonthInvalid}
                          error={
                            isStartMonthInvalid
                              ? "월은 1부터 12 사이로 입력해주세요."
                              : undefined
                          }
                          inputMode="numeric"
                          maxLength={2}
                          placeholder="월"
                          required
                          value={career.startMonth}
                          onChange={(value) => updateDateField("startMonth", value)}
                        />
                        <TextInput
                          id={`${titleId}-start-day`}
                          size="large"
                          aria-label="근무 시작 일"
                          aria-invalid={isStartDayInvalid}
                          error={
                            isStartDayInvalid
                              ? `일은 1부터 ${maximumStartDay} 사이로 입력해주세요.`
                              : undefined
                          }
                          inputMode="numeric"
                          maxLength={2}
                          placeholder="일"
                          required
                          value={career.startDay}
                          onChange={(value) => updateDateField("startDay", value)}
                        />
                      </DateFields>
                    </div>

                    <div>
                      <label htmlFor={`${titleId}-end-year`}>근무 종료일</label>
                      <DateFields>
                        <Select
                          id={`${titleId}-end-year`}
                          size="large"
                          className={career.endYear ? "completed" : undefined}
                          aria-label="근무 종료 연도"
                          options={YEAR_OPTIONS}
                          required
                          value={career.endYear}
                          onChange={(value) => updateField("endYear", value)}
                        />
                        <TextInput
                          id={`${titleId}-end-month`}
                          size="large"
                          aria-label="근무 종료 월"
                          aria-invalid={isEndMonthInvalid}
                          error={
                            isEndMonthInvalid
                              ? "월은 1부터 12 사이로 입력해주세요."
                              : undefined
                          }
                          inputMode="numeric"
                          maxLength={2}
                          placeholder="월"
                          required
                          value={career.endMonth}
                          onChange={(value) => updateDateField("endMonth", value)}
                        />
                        <TextInput
                          id={`${titleId}-end-day`}
                          size="large"
                          aria-label="근무 종료 일"
                          aria-invalid={isEndDayInvalid}
                          error={
                            isEndDayInvalid
                              ? `일은 1부터 ${maximumEndDay} 사이로 입력해주세요.`
                              : undefined
                          }
                          inputMode="numeric"
                          maxLength={2}
                          placeholder="일"
                          required
                          value={career.endDay}
                          onChange={(value) => updateDateField("endDay", value)}
                        />
                      </DateFields>
                    </div>

                    <Textarea
                      id={`${titleId}-resignation-reason`}
                      label="퇴직 사유"
                      placeholder="상세 내용을 입력하세요"
                      maxLength={100}
                      rows={5}
                      required
                      showCount
                      countTotal={100}
                      value={career.resignationReason}
                      onInput={resizeTextarea}
                      onChange={(value) => updateField("resignationReason", value)}
                    />
                    <Textarea
                      id={`${titleId}-note`}
                      label="비고"
                      placeholder="상세 내용을 입력하세요"
                      maxLength={100}
                      rows={5}
                      showCount
                      countTotal={100}
                      value={career.note}
                      onInput={resizeTextarea}
                      onChange={(value) => updateField("note", value)}
                    />
              </FieldGroup>
            </CareerCardBody>
          </CareerCard>

          <ActionBar>
            <ButtonGroup>
              <Button
                variant="tertiary"
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
                type="submit"
                disabled={!canSubmit}
              >
                {submitLabel}
              </Button>
            </ButtonGroup>
          </ActionBar>
        </CareerForm>
      </FormFlow>
    </IndividualRegistrationSubjectRoot>
  );
}

export default IndividualRegistrationCareer;
