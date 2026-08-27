import "krds-react/dist/index.css";

import { useId, useRef, useState } from "react";
import {
  Button,
  Radio,
  RadioGroup,
  Select,
  StepIndicator,
  Table,
  Textarea,
  TextInput,
} from "krds-react";
import { YEAR_OPTIONS } from "../career-certificate/CareerCertificateIssue.constants";
import useCareerFlowScroll from "../career-flow/useCareerFlowScroll";
import {
  getDaysInBirthMonth,
  isValidBirthDate,
  isValidBirthDay,
  isValidBirthMonth,
  sanitizeApplicantName,
  sanitizeDatePart,
} from "../career-certificate/CareerCertificateIssue.validation";
import {
  DateFields as ApplicantDateFields,
  FieldGroup as ApplicantFieldGroup,
  FieldLabel as ApplicantFieldLabel,
  SearchAction as ApplicantSearchAction,
} from "../career-certificate/steps/ApplicantStep.styles";
import {
  CardStack,
  CardTitle,
  Fieldset,
  FormCard,
  RadioSection,
  TableFrame,
} from "../career-certificate/steps/StepShared.styles";
import {
  CAREER_EDIT_REASON_OPTIONS,
  CAREER_EDIT_STAGE_TITLES,
  CAREER_EDIT_STEPS,
  CAREER_EDIT_TARGET_OPTIONS,
} from "./CareerEdit.constants";
import {
  CardSubheading as ReasonCardTitle,
  Fieldset as ReasonFieldset,
  FormCard as ReasonFormCard,
  RadioSection as ReasonRadioSection,
  TextareaFrame as ReasonTextareaFrame,
} from "../career-certificate/steps/ReasonStep.styles";
import CareerEditNoticeStep from "./CareerEditNoticeStep";
import AddressSearchModal, {
  type AddressSearchItem,
} from "../registration/address-search/AddressSearchModal";
import {
  ActionRow,
  AddressFields,
  CareerEditRoot,
  CurrentStepText,
  EmptyState,
  FlowError,
  FormFields,
  GenderField,
  PageHeader,
  PageTitle,
  PersonalIdentityRow,
  Stage,
  StageContent,
  StageEyebrow,
  StageHeader,
  StageTitle,
  StepIndicatorFrame,
  SuccessActions,
  SuccessMessage,
  SuccessPage,
  SuccessTitle,
  SummaryCard,
  SummaryTerm,
  SummaryValue,
  WorkflowPage,
} from "./CareerEdit.styles";
import type {
  CareerEditApplicant,
  CareerEditGender,
  CareerEditPersonalInfo,
  CareerEditProps,
  CareerEditReason,
  CareerEditRecord,
  CareerEditSubmission,
  CareerEditTarget,
} from "./CareerEdit.types";

export type {
  CareerEditApplicant,
  CareerEditGender,
  CareerEditPersonalInfo,
  CareerEditProps,
  CareerEditReason,
  CareerEditRecord,
  CareerEditSubmission,
  CareerEditTarget,
} from "./CareerEdit.types";

type CareerEditStep = 0 | 1 | 2 | 3 | 4;
type EditableCareerField = Exclude<keyof CareerEditRecord, "id">;

interface ReasonStepProps {
  reason: CareerEditReason;
  reasonDetail: string;
  onReasonChange: (reason: CareerEditReason) => void;
  onReasonDetailChange: (value: string) => void;
}

interface ApplicantStepProps {
  applicantName: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  canSearch: boolean;
  hasSearchResult: boolean;
  isSearching: boolean;
  searchError: string;
  searchResults: readonly CareerEditApplicant[];
  selectedApplicantId: string;
  onApplicantNameChange: (value: string) => void;
  onBirthYearChange: (value: string) => void;
  onBirthMonthChange: (value: string) => void;
  onBirthDayChange: (value: string) => void;
  onSearch: () => void;
  onSelectApplicant: (applicantId: string) => void;
}

interface EditTargetSelectionStepProps {
  editTarget: CareerEditTarget;
  careerRecords: readonly CareerEditRecord[];
  selectedCareerId: string;
  onEditTargetChange: (target: CareerEditTarget) => void;
  onSelectCareer: (careerId: string) => void;
}

interface EditDetailsStepProps {
  record: CareerEditRecord;
  onChange: (field: EditableCareerField, value: string) => void;
}

interface CareerDateInputProps {
  idPrefix: string;
  label: string;
  /** 라벨 옆 괄호 안내 문구. 생략하면 숫자 입력 안내를 보여준다. */
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}

interface PersonalDetailsStepProps {
  personalInfo: CareerEditPersonalInfo;
  onChange: <Field extends keyof CareerEditPersonalInfo>(
    field: Field,
    value: CareerEditPersonalInfo[Field],
  ) => void;
  onAddressSearch: () => void;
}

interface SuccessViewProps {
  headingId: string;
  submission: CareerEditSubmission;
  onAddAnother: () => void;
  onHome?: () => void;
}

interface BirthDateParts {
  year: string;
  month: string;
  day: string;
}

function getBirthDateParts(value: string | undefined): BirthDateParts {
  const [year = "", month = "", day = ""] = value?.match(/\d+/g) ?? [];

  return { year, month, day };
}

function getEditableDateParts(value: string): BirthDateParts {
  if (!value.includes(".")) {
    return getBirthDateParts(value);
  }

  const [year = "", month = "", day = ""] = value.split(".");

  return { year, month, day };
}

function updateEditableDatePart(
  value: string,
  part: keyof BirthDateParts,
  nextValue: string,
) {
  const dateParts = getEditableDateParts(value);

  return {
    ...dateParts,
    [part]: nextValue,
  } satisfies BirthDateParts;
}

function serializeEditableDate(dateParts: BirthDateParts) {
  return `${dateParts.year}.${dateParts.month}.${dateParts.day}`;
}

function isValidEditableDate(value: string) {
  const { year, month, day } = getEditableDateParts(value);

  return isValidBirthDate(year, month, day);
}

// 재직 중 경력은 종료일이 비어 있으므로 "모든 부분이 빈 날짜"를 구분한다.
function isEmptyEditableDate(value: string) {
  const { year, month, day } = getEditableDateParts(value);

  return !year && !month && !day;
}

function normalizeEditableDate(value: string) {
  const { year, month, day } = getEditableDateParts(value);

  if (!isValidBirthDate(year, month, day)) {
    return value;
  }

  return getNormalizedBirthDate(year, month, day);
}

function createPersonalInfo(
  applicant: CareerEditApplicant | undefined,
): CareerEditPersonalInfo {
  const { year, month, day } = getBirthDateParts(applicant?.birthDate);

  return {
    name: applicant?.name ?? "",
    gender: applicant?.gender ?? "",
    birthYear: year,
    birthMonth: month,
    birthDay: day,
    address: applicant?.address ?? "",
  };
}

function getNormalizedBirthDate(year: string, month: string, day: string) {
  return `${year}.${month.padStart(2, "0")}.${day.padStart(2, "0")}`;
}

function normalizeApplicantBirthDate(value: string) {
  const { year, month, day } = getBirthDateParts(value);

  return getNormalizedBirthDate(year, month, day);
}

function getBirthDateLabel(value: string) {
  const { year, month, day } = getBirthDateParts(value);

  if (!year || !month || !day) {
    return value;
  }

  return `${year}년 ${month.padStart(2, "0")}월 ${day.padStart(2, "0")}일`;
}

function isCareerEditReason(value: string): value is CareerEditReason {
  return CAREER_EDIT_REASON_OPTIONS.some((option) => option.value === value);
}

function isCareerEditTarget(value: string): value is CareerEditTarget {
  return CAREER_EDIT_TARGET_OPTIONS.some((option) => option.value === value);
}

function isCareerEditGender(value: string): value is CareerEditGender {
  return value === "male" || value === "female";
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function cloneRecord(record: CareerEditRecord | undefined): CareerEditRecord {
  if (record) {
    return { ...record };
  }

  return {
    id: "",
    position: "",
    duties: "",
    department: "",
    startDate: "",
    endDate: "",
    retirementReason: "",
    note: "",
  };
}

function ReasonStep({
  reason,
  reasonDetail,
  onReasonChange,
  onReasonDetailChange,
}: ReasonStepProps) {
  const handleReasonChange = (value: string) => {
    if (isCareerEditReason(value)) {
      onReasonChange(value);
    }
  };

  return (
    <ReasonFormCard>
      <ReasonFieldset>
        <legend className="sr-only">수정 사유 선택</legend>
        <ReasonCardTitle>수정 사유 입력</ReasonCardTitle>
        <ReasonRadioSection>
          <RadioGroup
            name="career-edit-reason"
            value={reason}
            onChange={handleReasonChange}
            column
          >
            {CAREER_EDIT_REASON_OPTIONS.map((option) => (
              <Radio
                key={option.value}
                id={`career-edit-reason-${option.value}`}
                value={option.value}
              >
                {option.label}
              </Radio>
            ))}
          </RadioGroup>
        </ReasonRadioSection>
      </ReasonFieldset>

      <ReasonTextareaFrame>
        <Textarea
          aria-label="수정 사유 상세 내용"
          placeholder="상세 내용을 입력하세요"
          value={reasonDetail}
          onChange={onReasonDetailChange}
          maxLength={100}
          showCount
        />
      </ReasonTextareaFrame>
    </ReasonFormCard>
  );
}

function ApplicantStep({
  applicantName,
  birthYear,
  birthMonth,
  birthDay,
  canSearch,
  hasSearchResult,
  isSearching,
  searchError,
  searchResults,
  selectedApplicantId,
  onApplicantNameChange,
  onBirthYearChange,
  onBirthMonthChange,
  onBirthDayChange,
  onSearch,
  onSelectApplicant,
}: ApplicantStepProps) {
  const isBirthMonthInvalid =
    birthMonth.length > 0 && !isValidBirthMonth(birthMonth);
  const maximumBirthDay = getDaysInBirthMonth(birthYear, birthMonth);
  const isBirthDayInvalid =
    birthDay.length > 0 &&
    !isValidBirthDay(birthYear, birthMonth, birthDay);

  return (
    <CardStack>
      <FormCard>
        <CardTitle>기본 정보 입력</CardTitle>
        <ApplicantFieldGroup>
          <TextInput
            id="career-edit-applicant-name"
            label="이름"
            placeholder="이름을 입력해주세요"
            value={applicantName}
            onChange={onApplicantNameChange}
            autoComplete="name"
          />
        </ApplicantFieldGroup>
        <ApplicantFieldGroup>
          <ApplicantFieldLabel>
            생년월일 (숫자만 입력해주세요)
          </ApplicantFieldLabel>
          <ApplicantDateFields>
            <Select
              aria-label="생년"
              options={YEAR_OPTIONS}
              value={birthYear}
              onChange={onBirthYearChange}
            />
            <TextInput
              aria-label="생월"
              aria-invalid={isBirthMonthInvalid}
              error={
                isBirthMonthInvalid
                  ? "월은 1부터 12 사이로 입력해주세요."
                  : undefined
              }
              inputMode="numeric"
              maxLength={2}
              pattern="[0-9]*"
              placeholder="월"
              value={birthMonth}
              onChange={onBirthMonthChange}
            />
            <TextInput
              aria-label="생일"
              aria-invalid={isBirthDayInvalid}
              error={
                isBirthDayInvalid
                  ? `일은 1부터 ${maximumBirthDay} 사이로 입력해주세요.`
                  : undefined
              }
              inputMode="numeric"
              maxLength={2}
              pattern="[0-9]*"
              placeholder="일"
              value={birthDay}
              onChange={onBirthDayChange}
            />
          </ApplicantDateFields>
        </ApplicantFieldGroup>
        <ApplicantSearchAction>
          <Button
            variant="secondary"
            size="large"
            type="button"
            disabled={!canSearch || isSearching}
            onClick={onSearch}
          >
            {isSearching ? "조회 중..." : "대상자 조회"}
          </Button>
        </ApplicantSearchAction>
        {searchError && <FlowError role="alert">{searchError}</FlowError>}
      </FormCard>

      {hasSearchResult && (
        <FormCard>
          <CardTitle>대상자 선택</CardTitle>
          {searchResults.length > 0 ? (
            <TableFrame>
              <Table>
                <Table.Caption className="sr-only">
                  경력사항 수정 대상자 조회 결과
                </Table.Caption>
                <Table.Colgroup>
                  <Table.Col width="80px" />
                  <Table.Col width="110px" />
                  <Table.Col width="170px" />
                  <Table.Col />
                </Table.Colgroup>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th scope="col">선택</Table.Th>
                    <Table.Th scope="col">이름</Table.Th>
                    <Table.Th scope="col">생년월일</Table.Th>
                    <Table.Th scope="col">주소</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {searchResults.map((applicant) => (
                    <Table.Tr key={applicant.id}>
                      <Table.Td>
                        <Radio
                          id={`career-edit-applicant-${applicant.id}`}
                          name="career-edit-applicant"
                          value={applicant.id}
                          checked={selectedApplicantId === applicant.id}
                          onChange={() => onSelectApplicant(applicant.id)}
                        >
                          <span className="sr-only">
                            {applicant.name} 선택
                          </span>
                        </Radio>
                      </Table.Td>
                      <Table.Td>{applicant.name}</Table.Td>
                      <Table.Td>
                        {getBirthDateLabel(applicant.birthDate)}
                      </Table.Td>
                      <Table.Td>{applicant.address}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </TableFrame>
          ) : (
            <TableFrame>
              <EmptyState role="status">
                입력한 정보와 일치하는 대상자가 없습니다. 이름과 생년월일을
                확인해 주세요.
              </EmptyState>
            </TableFrame>
          )}
        </FormCard>
      )}
    </CardStack>
  );
}

function EditTargetSelectionStep({
  editTarget,
  careerRecords,
  selectedCareerId,
  onEditTargetChange,
  onSelectCareer,
}: EditTargetSelectionStepProps) {
  const handleEditTargetChange = (value: string) => {
    if (isCareerEditTarget(value)) {
      onEditTargetChange(value);
    }
  };

  return (
    <CardStack>
      <FormCard>
        <Fieldset>
          <legend className="sr-only">수정 대상 선택</legend>
          <CardTitle>수정 대상 선택</CardTitle>
          <RadioSection>
            <RadioGroup
              name="career-edit-target"
              value={editTarget}
              onChange={handleEditTargetChange}
              column
            >
              {CAREER_EDIT_TARGET_OPTIONS.map((option) => (
                <Radio
                  key={option.value}
                  id={`career-edit-target-${option.value}`}
                  value={option.value}
                >
                  {option.label}
                </Radio>
              ))}
            </RadioGroup>
          </RadioSection>
        </Fieldset>
      </FormCard>

      {editTarget === "career" && (
        <FormCard>
          <CardTitle>내역 선택</CardTitle>
          {careerRecords.length > 0 ? (
            <TableFrame>
              <Table>
                <Table.Caption className="sr-only">
                  수정할 경력사항 내역
                </Table.Caption>
                <Table.Colgroup>
                  <Table.Col width="80px" />
                  <Table.Col width="260px" />
                  <Table.Col width="150px" />
                  <Table.Col width="220px" />
                </Table.Colgroup>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th scope="col">선택</Table.Th>
                    <Table.Th scope="col">담당업무</Table.Th>
                    <Table.Th scope="col">근무부서</Table.Th>
                    <Table.Th scope="col">근무 기간</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {careerRecords.map((record) => (
                    <Table.Tr key={record.id}>
                      <Table.Td>
                        <Radio
                          id={`career-edit-record-${record.id}`}
                          name="career-edit-record"
                          value={record.id}
                          checked={selectedCareerId === record.id}
                          aria-label={`${record.duties} 경력 선택`}
                          onChange={() => onSelectCareer(record.id)}
                        />
                      </Table.Td>
                      <Table.Td>{record.duties}</Table.Td>
                      <Table.Td>{record.department}</Table.Td>
                      <Table.Td>
                        {record.startDate} ~ {record.endDate}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </TableFrame>
          ) : (
            <TableFrame>
              <EmptyState role="status">
                수정 가능한 경력 내역이 없습니다.
              </EmptyState>
            </TableFrame>
          )}
        </FormCard>
      )}
    </CardStack>
  );
}

function PersonalDetailsStep({
  personalInfo,
  onChange,
  onAddressSearch,
}: PersonalDetailsStepProps) {
  const isBirthMonthInvalid =
    personalInfo.birthMonth.length > 0 &&
    !isValidBirthMonth(personalInfo.birthMonth);
  const maximumBirthDay = getDaysInBirthMonth(
    personalInfo.birthYear,
    personalInfo.birthMonth,
  );
  const isBirthDayInvalid =
    personalInfo.birthDay.length > 0 &&
    !isValidBirthDay(
      personalInfo.birthYear,
      personalInfo.birthMonth,
      personalInfo.birthDay,
    );

  const handleGenderChange = (value: string) => {
    if (isCareerEditGender(value)) {
      onChange("gender", value);
    }
  };

  return (
    <FormCard>
      <CardTitle>인적 사항 수정</CardTitle>

      <ApplicantFieldGroup>
        <PersonalIdentityRow>
          <TextInput
            id="career-edit-personal-name"
            label="이름"
            placeholder="이름을 입력해주세요"
            value={personalInfo.name}
            onChange={(value) =>
              onChange("name", sanitizeApplicantName(value))
            }
            autoComplete="name"
          />
          <GenderField>
            <ApplicantFieldLabel>성별</ApplicantFieldLabel>
            <RadioGroup
              name="career-edit-personal-gender"
              value={personalInfo.gender}
              onChange={handleGenderChange}
            >
              <Radio id="career-edit-personal-gender-male" value="male">
                남
              </Radio>
              <Radio id="career-edit-personal-gender-female" value="female">
                여
              </Radio>
            </RadioGroup>
          </GenderField>
        </PersonalIdentityRow>
      </ApplicantFieldGroup>

      <ApplicantFieldGroup>
        <ApplicantFieldLabel>
          생년월일 (숫자만 입력해주세요)
        </ApplicantFieldLabel>
        <ApplicantDateFields>
          <Select
            aria-label="수정할 생년"
            options={YEAR_OPTIONS}
            value={personalInfo.birthYear}
            onChange={(value) => onChange("birthYear", value)}
          />
          <TextInput
            aria-label="수정할 생월"
            aria-invalid={isBirthMonthInvalid}
            error={
              isBirthMonthInvalid
                ? "월은 1부터 12 사이로 입력해주세요."
                : undefined
            }
            inputMode="numeric"
            maxLength={2}
            pattern="[0-9]*"
            placeholder="월"
            value={personalInfo.birthMonth}
            onChange={(value) =>
              onChange("birthMonth", sanitizeDatePart(value))
            }
          />
          <TextInput
            aria-label="수정할 생일"
            aria-invalid={isBirthDayInvalid}
            error={
              isBirthDayInvalid
                ? `일은 1부터 ${maximumBirthDay} 사이로 입력해주세요.`
                : undefined
            }
            inputMode="numeric"
            maxLength={2}
            pattern="[0-9]*"
            placeholder="일"
            value={personalInfo.birthDay}
            onChange={(value) =>
              onChange("birthDay", sanitizeDatePart(value))
            }
          />
        </ApplicantDateFields>
      </ApplicantFieldGroup>

      <ApplicantFieldGroup>
        <ApplicantFieldLabel>주소지</ApplicantFieldLabel>
        <AddressFields>
          <TextInput
            aria-label="주소지"
            placeholder="검색 버튼을 눌러주세요"
            value={personalInfo.address}
            onChange={(value) => onChange("address", value)}
            autoComplete="street-address"
          />
          <Button
            variant="secondary"
            size="large"
            type="button"
            onClick={onAddressSearch}
          >
            검색
          </Button>
        </AddressFields>
      </ApplicantFieldGroup>
    </FormCard>
  );
}

function CareerDateInput({
  idPrefix,
  label,
  hint = "숫자만 입력해주세요",
  value,
  onChange,
}: CareerDateInputProps) {
  const { year, month, day } = getEditableDateParts(value);
  const isMonthInvalid = month.length > 0 && !isValidBirthMonth(month);
  const maximumDay = getDaysInBirthMonth(year, month);
  const isDayInvalid =
    day.length > 0 && !isValidBirthDay(year, month, day);

  const handleDatePartChange = (
    part: keyof BirthDateParts,
    nextValue: string,
  ) => {
    onChange(
      serializeEditableDate(updateEditableDatePart(value, part, nextValue)),
    );
  };

  return (
    <div>
      <ApplicantFieldLabel>
        {label} ({hint})
      </ApplicantFieldLabel>
      <ApplicantDateFields>
        <Select
          aria-label={`${label} 연도`}
          options={YEAR_OPTIONS}
          value={year}
          onChange={(nextYear) =>
            handleDatePartChange("year", nextYear)
          }
        />
        <TextInput
          id={`${idPrefix}-month`}
          aria-label={`${label} 월`}
          aria-invalid={isMonthInvalid}
          error={
            isMonthInvalid
              ? "월은 1부터 12 사이로 입력해주세요."
              : undefined
          }
          inputMode="numeric"
          maxLength={2}
          pattern="[0-9]*"
          placeholder="월"
          value={month}
          onChange={(nextMonth) =>
            handleDatePartChange("month", sanitizeDatePart(nextMonth))
          }
        />
        <TextInput
          id={`${idPrefix}-day`}
          aria-label={`${label} 일`}
          aria-invalid={isDayInvalid}
          error={
            isDayInvalid
              ? `일은 1부터 ${maximumDay} 사이로 입력해주세요.`
              : undefined
          }
          inputMode="numeric"
          maxLength={2}
          pattern="[0-9]*"
          placeholder="일"
          value={day}
          onChange={(nextDay) =>
            handleDatePartChange("day", sanitizeDatePart(nextDay))
          }
        />
      </ApplicantDateFields>
    </div>
  );
}

function EditDetailsStep({ record, onChange }: EditDetailsStepProps) {
  return (
    <CardStack>
      <FormCard>
        <CardTitle>경력 사항 수정</CardTitle>
        <ApplicantFieldGroup>
          <FormFields>
            <TextInput
              id="career-edit-position"
              label="직급명"
              placeholder="직급을 입력해주세요"
              value={record.position}
              onChange={(value) => onChange("position", value)}
            />
            <TextInput
              id="career-edit-duties"
              label="담당업무"
              placeholder="업무 내용을 입력해주세요"
              value={record.duties}
              onChange={(value) => onChange("duties", value)}
            />
            <TextInput
              id="career-edit-department"
              label="근무부서"
              placeholder="부서를 입력해주세요"
              value={record.department}
              onChange={(value) => onChange("department", value)}
            />
            <CareerDateInput
              idPrefix="career-edit-start-date"
              label="근무 시작일"
              value={record.startDate}
              onChange={(value) => onChange("startDate", value)}
            />
            <CareerDateInput
              idPrefix="career-edit-end-date"
              label="근무 종료일"
              hint="재직 중이면 비워 두세요"
              value={record.endDate}
              onChange={(value) => onChange("endDate", value)}
            />
          </FormFields>
        </ApplicantFieldGroup>
      </FormCard>

      <FormCard>
        <CardTitle>퇴직 사유 및 비고</CardTitle>
        <ApplicantFieldGroup>
          <FormFields>
            <Textarea
              id="career-edit-retirement-reason"
              label="퇴직 사유"
              placeholder="상세 내용을 입력하세요"
              value={record.retirementReason}
              onChange={(value) => onChange("retirementReason", value)}
              maxLength={100}
              showCount
            />
            <Textarea
              id="career-edit-note"
              label="비고"
              placeholder="상세 내용을 입력하세요"
              value={record.note}
              onChange={(value) => onChange("note", value)}
              maxLength={100}
              showCount
            />
          </FormFields>
        </ApplicantFieldGroup>
      </FormCard>
    </CardStack>
  );
}

function SuccessView({
  headingId,
  submission,
  onAddAnother,
  onHome,
}: SuccessViewProps) {
  return (
    <SuccessPage aria-labelledby={headingId} aria-live="polite">
      <SuccessTitle id={headingId}>
        경력사항 수정
      </SuccessTitle>
      <SuccessMessage>
        업무 처리가 <strong>완료</strong>되었습니다.
      </SuccessMessage>

      <SummaryCard>
        <SummaryTerm>대상자</SummaryTerm>
        <SummaryValue>{submission.applicant.name}</SummaryValue>
        <SummaryTerm>수정 대상</SummaryTerm>
        <SummaryValue>
          {submission.editTarget === "personal"
            ? "인적 사항"
            : `${submission.record.department} · ${submission.record.duties}`}
        </SummaryValue>
      </SummaryCard>

      <SuccessActions>
        <Button
          variant="tertiary"
          size="xlarge"
          type="button"
          onClick={onAddAnother}
        >
          추가 수정하기
        </Button>
        <Button
          variant="primary"
          size="xlarge"
          type="button"
          onClick={onHome}
        >
          홈으로 돌아가기
        </Button>
      </SuccessActions>
    </SuccessPage>
  );
}

// 실제 데이터는 onSearch / onLoadCareerRecords 로 가져온다. 기본값은 빈 목록.
const EMPTY_APPLICANTS: readonly CareerEditApplicant[] = [];
const EMPTY_RECORDS: readonly CareerEditRecord[] = [];

function CareerEdit({
  initialStep = 0,
  initialEditTarget = "personal",
  applicants = EMPTY_APPLICANTS,
  careerRecords = EMPTY_RECORDS,
  onCancel,
  onSearchAddress,
  onSearch,
  onLoadCareerRecords,
  onComplete,
  onAddAnother,
  onHome,
}: CareerEditProps) {
  const headingId = useId();
  const [isAddressSearchOpen, setIsAddressSearchOpen] = useState(false);
  const initialApplicant = initialStep > 2 ? applicants[0] : undefined;
  const initialBirthDate = getBirthDateParts(initialApplicant?.birthDate);
  const [currentStep, setCurrentStep] =
    useState<CareerEditStep>(initialStep);
  const [noticeAccepted, setNoticeAccepted] = useState(initialStep > 0);
  const [reason, setReason] = useState<CareerEditReason>("visit");
  const [reasonDetail, setReasonDetail] = useState("");
  const [applicantName, setApplicantName] = useState(
    initialApplicant?.name ?? "",
  );
  const [birthYear, setBirthYear] = useState(initialBirthDate.year);
  const [birthMonth, setBirthMonth] = useState(initialBirthDate.month);
  const [birthDay, setBirthDay] = useState(initialBirthDate.day);
  const [hasSearchResult, setHasSearchResult] = useState(initialStep > 2);
  const [selectedApplicantId, setSelectedApplicantId] = useState(
    initialStep > 2 ? (applicants[0]?.id ?? "") : "",
  );
  const [editTarget, setEditTarget] =
    useState<CareerEditTarget>(initialEditTarget);
  const [personalInfo, setPersonalInfo] = useState<CareerEditPersonalInfo>(
    () => createPersonalInfo(initialApplicant),
  );
  const [selectedCareerId, setSelectedCareerId] = useState(
    careerRecords[0]?.id ?? "",
  );
  const [draftRecord, setDraftRecord] = useState<CareerEditRecord>(() =>
    cloneRecord(careerRecords[0]),
  );
  const [completedSubmission, setCompletedSubmission] =
    useState<CareerEditSubmission | null>(null);
  const [fetchedApplicants, setFetchedApplicants] = useState<
    readonly CareerEditApplicant[] | null
  >(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [fetchedRecords, setFetchedRecords] = useState<
    readonly CareerEditRecord[] | null
  >(null);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [recordsError, setRecordsError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  // 검색 중 입력이 바뀌어 리셋된 뒤 도착하는 이전 응답을 무시하기 위한 요청 id.
  const searchRequestIdRef = useRef(0);
  const careerEditView = completedSubmission
    ? "success"
    : `step-${currentStep}`;

  useCareerFlowScroll(careerEditView);

  const searchBirthDate = getNormalizedBirthDate(
    birthYear,
    birthMonth,
    birthDay,
  );
  const availableApplicants = onSearch ? (fetchedApplicants ?? []) : applicants;
  const effectiveCareerRecords = onLoadCareerRecords
    ? (fetchedRecords ?? [])
    : careerRecords;
  const searchResults = hasSearchResult
    ? onSearch
      ? (fetchedApplicants ?? [])
      : applicants.filter(
          (applicant) =>
            applicant.name === applicantName.trim() &&
            normalizeApplicantBirthDate(applicant.birthDate) ===
              searchBirthDate,
        )
    : [];
  const canSearch =
    applicantName.trim().length > 0 &&
    isValidBirthDate(birthYear, birthMonth, birthDay);
  const selectedApplicant = availableApplicants.find(
    (applicant) => applicant.id === selectedApplicantId,
  );
  const canSavePersonalInfo =
    personalInfo.name.trim().length > 0 &&
    Boolean(personalInfo.gender) &&
    isValidBirthDate(
      personalInfo.birthYear,
      personalInfo.birthMonth,
      personalInfo.birthDay,
    ) &&
    personalInfo.address.trim().length > 0;
  const canSaveCareerInfo =
    draftRecord.position.trim().length > 0 &&
    draftRecord.duties.trim().length > 0 &&
    draftRecord.department.trim().length > 0 &&
    isValidEditableDate(draftRecord.startDate) &&
    // 재직 중(퇴직일 없음) 경력은 종료일을 비워둔 채 저장할 수 있어야 한다.
    (isEmptyEditableDate(draftRecord.endDate) ||
      isValidEditableDate(draftRecord.endDate));
  const canContinue =
    (currentStep === 0 && noticeAccepted) ||
    (currentStep === 1 &&
      (reason !== "other" || reasonDetail.trim().length > 0)) ||
    (currentStep === 2 && Boolean(selectedApplicantId)) ||
    (currentStep === 3 &&
      (editTarget === "personal" || Boolean(selectedCareerId))) ||
    (currentStep === 4 &&
      (editTarget === "personal"
        ? canSavePersonalInfo
        : canSaveCareerInfo));

  const resetSearchResult = () => {
    searchRequestIdRef.current += 1;
    setHasSearchResult(false);
    setSelectedApplicantId("");
    setPersonalInfo(createPersonalInfo(undefined));
    setFetchedApplicants(null);
    setSearchError("");
    setFetchedRecords(null);
    setRecordsError("");
  };

  const handleApplicantNameChange = (value: string) => {
    const sanitizedValue = sanitizeApplicantName(value);

    if (sanitizedValue === applicantName) {
      return;
    }

    setApplicantName(sanitizedValue);
    resetSearchResult();
  };

  const handleBirthYearChange = (value: string) => {
    setBirthYear(value);
    resetSearchResult();
  };

  const handleBirthMonthChange = (value: string) => {
    setBirthMonth(sanitizeDatePart(value));
    resetSearchResult();
  };

  const handleBirthDayChange = (value: string) => {
    setBirthDay(sanitizeDatePart(value));
    resetSearchResult();
  };

  const handleSearch = async () => {
    if (!canSearch || isSearching) {
      return;
    }

    if (!onSearch) {
      const matchedApplicant = applicants.find(
        (applicant) =>
          applicant.name === applicantName.trim() &&
          normalizeApplicantBirthDate(applicant.birthDate) === searchBirthDate,
      );

      setHasSearchResult(true);
      setSelectedApplicantId(matchedApplicant?.id ?? "");
      setPersonalInfo(createPersonalInfo(matchedApplicant));
      return;
    }

    const requestId = ++searchRequestIdRef.current;

    setIsSearching(true);
    setSearchError("");

    try {
      const results = await onSearch({
        name: applicantName.trim(),
        birthDate: `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`,
      });

      // 응답 대기 중 입력이 바뀌어 리셋됐다면 이전 응답으로 화면을 덮어쓰지 않는다.
      if (requestId !== searchRequestIdRef.current) {
        return;
      }

      const onlyMatch = results.length === 1 ? results[0] : undefined;

      setFetchedApplicants(results);
      setHasSearchResult(true);
      setSelectedApplicantId(onlyMatch?.id ?? "");
      setPersonalInfo(createPersonalInfo(onlyMatch));
    } catch (error) {
      if (requestId !== searchRequestIdRef.current) {
        return;
      }

      setFetchedApplicants(null);
      setHasSearchResult(false);
      setSelectedApplicantId("");
      setSearchError(
        getErrorMessage(
          error,
          "대상자 조회 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        ),
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectApplicant = (applicantId: string) => {
    const applicant = availableApplicants.find(
      (candidate) => candidate.id === applicantId,
    );

    setSelectedApplicantId(applicantId);
    setPersonalInfo(createPersonalInfo(applicant));
  };

  const handleSelectCareer = (careerId: string) => {
    const selectedRecord = effectiveCareerRecords.find(
      (record) => record.id === careerId,
    );

    setSelectedCareerId(careerId);
    setDraftRecord(cloneRecord(selectedRecord));
  };

  const handleDraftChange = (
    field: EditableCareerField,
    value: string,
  ) => {
    setDraftRecord((currentRecord) => ({
      ...currentRecord,
      [field]: value,
    }));
  };

  const handlePersonalInfoChange = <
    Field extends keyof CareerEditPersonalInfo,
  >(
    field: Field,
    value: CareerEditPersonalInfo[Field],
  ) => {
    setPersonalInfo((currentInfo) => ({
      ...currentInfo,
      [field]: value,
    }));
  };

  const handleAddressSearch = () => {
    if (onSearchAddress) {
      setIsAddressSearchOpen(true);
      return;
    }

    // 주소 검색이 연결되지 않은 경우: 조회된 대상자의 주소로 되돌린다.
    if (!selectedApplicant) {
      return;
    }

    setPersonalInfo((currentInfo) => ({
      ...currentInfo,
      address: selectedApplicant.address,
    }));
  };

  const handleAddressSelect = (selectedAddress: AddressSearchItem) => {
    setPersonalInfo((currentInfo) => ({
      ...currentInfo,
      address: selectedAddress.roadAddress,
    }));
    setIsAddressSearchOpen(false);
  };

  const handlePrevious = () => {
    if (currentStep === 0) {
      onCancel?.();
      return;
    }

    if (currentStep === 1) {
      setCurrentStep(0);
      return;
    }

    if (currentStep === 2) {
      setCurrentStep(1);
      return;
    }

    if (currentStep === 3) {
      setCurrentStep(2);
      return;
    }

    setCurrentStep(3);
  };

  const handleNext = async () => {
    if (!canContinue || isLoadingRecords || isSubmitting) {
      return;
    }

    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (onLoadCareerRecords && selectedApplicant) {
        setIsLoadingRecords(true);
        setRecordsError("");

        try {
          const records = await onLoadCareerRecords(selectedApplicant.id);

          setFetchedRecords(records);
          setSelectedCareerId(records[0]?.id ?? "");
          setDraftRecord(cloneRecord(records[0]));
        } catch (error) {
          setRecordsError(
            getErrorMessage(
              error,
              "경력 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
            ),
          );
          return;
        } finally {
          setIsLoadingRecords(false);
        }
      }

      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      setCurrentStep(4);
      return;
    }

    if (!selectedApplicant) {
      return;
    }

    const submissionBase = {
      reason,
      reasonDetail,
      applicant: selectedApplicant,
    };
    const submission: CareerEditSubmission =
      editTarget === "personal"
        ? {
            ...submissionBase,
            editTarget: "personal",
            personalInfo: { ...personalInfo },
          }
        : {
            ...submissionBase,
            editTarget: "career",
            record: {
              ...draftRecord,
              startDate: normalizeEditableDate(draftRecord.startDate),
              // 재직 중 경력은 종료일을 빈 문자열로 넘긴다("..") 형태 방지).
              endDate: isEmptyEditableDate(draftRecord.endDate)
                ? ""
                : normalizeEditableDate(draftRecord.endDate),
            },
          };

    setIsSubmitting(true);
    setSubmissionError("");

    try {
      await onComplete?.(submission);
      setCompletedSubmission(submission);
    } catch (error) {
      setSubmissionError(
        getErrorMessage(
          error,
          "저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAnother = () => {
    const firstRecord = onLoadCareerRecords ? undefined : careerRecords[0];

    setFetchedApplicants(null);
    setIsSearching(false);
    setSearchError("");
    setFetchedRecords(null);
    setIsLoadingRecords(false);
    setRecordsError("");
    setIsSubmitting(false);
    setSubmissionError("");
    setCurrentStep(0);
    setNoticeAccepted(false);
    setReason("visit");
    setReasonDetail("");
    setApplicantName("");
    setBirthYear("");
    setBirthMonth("");
    setBirthDay("");
    setHasSearchResult(false);
    setSelectedApplicantId("");
    setEditTarget("personal");
    setPersonalInfo(createPersonalInfo(undefined));
    setSelectedCareerId(firstRecord?.id ?? "");
    setDraftRecord(cloneRecord(firstRecord));
    setCompletedSubmission(null);
    onAddAnother?.();
  };

  return (
    <CareerEditRoot key={careerEditView}>
      {completedSubmission ? (
        <SuccessView
          headingId={headingId}
          submission={completedSubmission}
          onAddAnother={handleAddAnother}
          onHome={onHome}
        />
      ) : (
        <WorkflowPage>
          <PageHeader>
            <PageTitle id={headingId}>
              경력사항 수정
            </PageTitle>
            <StepIndicatorFrame>
              <StepIndicator
                steps={CAREER_EDIT_STEPS.map((step) => ({ ...step }))}
                currentStep={currentStep}
                currentStepText="현재 단계"
              />
            </StepIndicatorFrame>
          </PageHeader>

          <Stage>
            <StageHeader>
              <StageEyebrow>
                <CurrentStepText>{currentStep + 1}단계</CurrentStepText>
                {` / ${CAREER_EDIT_STEPS.length}단계`}
              </StageEyebrow>
              <StageTitle>{CAREER_EDIT_STAGE_TITLES[currentStep]}</StageTitle>
            </StageHeader>

            <StageContent>
              {currentStep === 0 && (
                <CareerEditNoticeStep
                  accepted={noticeAccepted}
                  onAcceptedChange={setNoticeAccepted}
                />
              )}
              {currentStep === 1 && (
                <ReasonStep
                  reason={reason}
                  reasonDetail={reasonDetail}
                  onReasonChange={setReason}
                  onReasonDetailChange={setReasonDetail}
                />
              )}
              {currentStep === 2 && (
                <ApplicantStep
                  applicantName={applicantName}
                  birthYear={birthYear}
                  birthMonth={birthMonth}
                  birthDay={birthDay}
                  canSearch={canSearch}
                  hasSearchResult={hasSearchResult}
                  isSearching={isSearching}
                  searchError={searchError}
                  searchResults={searchResults}
                  selectedApplicantId={selectedApplicantId}
                  onApplicantNameChange={handleApplicantNameChange}
                  onBirthYearChange={handleBirthYearChange}
                  onBirthMonthChange={handleBirthMonthChange}
                  onBirthDayChange={handleBirthDayChange}
                  onSearch={() => void handleSearch()}
                  onSelectApplicant={handleSelectApplicant}
                />
              )}
              {currentStep === 3 && (
                <EditTargetSelectionStep
                  editTarget={editTarget}
                  careerRecords={effectiveCareerRecords}
                  selectedCareerId={selectedCareerId}
                  onEditTargetChange={setEditTarget}
                  onSelectCareer={handleSelectCareer}
                />
              )}
              {currentStep === 4 && editTarget === "personal" && (
                <PersonalDetailsStep
                  personalInfo={personalInfo}
                  onChange={handlePersonalInfoChange}
                  onAddressSearch={handleAddressSearch}
                />
              )}
              {currentStep === 4 && editTarget === "career" && (
                <EditDetailsStep
                  record={draftRecord}
                  onChange={handleDraftChange}
                />
              )}
            </StageContent>

            {currentStep === 2 && recordsError && (
              <FlowError role="alert">{recordsError}</FlowError>
            )}
            {currentStep === 4 && submissionError && (
              <FlowError role="alert">{submissionError}</FlowError>
            )}
            <ActionRow>
              <Button
                variant="tertiary"
                size="xlarge"
                type="button"
                disabled={isLoadingRecords || isSubmitting}
                onClick={handlePrevious}
              >
                이전으로
              </Button>
              <Button
                variant="primary"
                size="xlarge"
                type="button"
                disabled={!canContinue || isLoadingRecords || isSubmitting}
                onClick={() => void handleNext()}
              >
                {currentStep === 4
                  ? isSubmitting
                    ? "저장 중..."
                    : "저장하기"
                  : isLoadingRecords
                    ? "불러오는 중..."
                    : "다음으로"}
              </Button>
            </ActionRow>
          </Stage>
        </WorkflowPage>
      )}
      {onSearchAddress && (
        <AddressSearchModal
          open={isAddressSearchOpen}
          onOpenChange={setIsAddressSearchOpen}
          onSearch={onSearchAddress}
          onSelect={handleAddressSelect}
        />
      )}
    </CareerEditRoot>
  );
}

export default CareerEdit;
