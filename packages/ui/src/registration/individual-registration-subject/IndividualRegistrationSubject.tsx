import "krds-react/dist/index.css";

import { useId, useMemo, useState } from "react";
import {
  Button,
  Radio,
  RadioGroup,
  Select,
  StepIndicator,
  Table,
  TextInput,
} from "krds-react";
import {
  ActionBar,
  AddressFields,
  BirthDateFields,
  ButtonGroup,
  DuplicateCheckArea,
  DuplicateResultCard,
  DuplicateResultTitle,
  DuplicateTableFrame,
  DuplicateActionGroup,
  FieldLabel,
  FormCard,
  FormFlow,
  FormMainContent,
  FormSectionTitle,
  IndividualRegistrationSubjectRoot,
  NameAndGenderFields,
  PageHeader,
  PageTitle,
  RadioFieldset,
  StepCurrentText,
  StepEyebrow,
  StepHeader,
  StepTitle,
  StyledStepIndicator,
} from "./individualRegistrationSubject.styles";
import { YEAR_OPTIONS } from "../../career-certificate/CareerCertificateIssue.constants";
import {
  getDaysInBirthMonth,
  isValidBirthDate,
  isValidBirthDay,
  isValidBirthMonth,
  sanitizeApplicantName,
  sanitizeDatePart,
} from "../../career-certificate/CareerCertificateIssue.validation";
import { findDuplicateCandidates } from "./IndividualRegistrationSubject.utils";

export interface IndividualRegistrationSubjectStep {
  id: string;
  title: string;
}

export interface IndividualRegistrationSubjectData {
  name: string;
  gender: "male" | "female";
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  address: string;
  duplicateResolution?: "existing" | "new";
  existingSubjectId?: string;
}

export interface IndividualRegistrationDuplicateCandidate {
  id: string;
  name: string;
  gender: "male" | "female";
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  address: string;
}

export interface IndividualRegistrationSubjectProps {
  title?: string;
  steps?: readonly IndividualRegistrationSubjectStep[];
  currentStep?: number;
  stepLabel?: string;
  stepTitle?: string;
  addressSearchResult?: string;
  duplicateCandidates?: readonly IndividualRegistrationDuplicateCandidate[];
  previousLabel?: string;
  nextLabel?: string;
  onPrevious?: () => void;
  onNext?: (subject: IndividualRegistrationSubjectData) => void;
}

const defaultSteps = [
  { id: "notice", title: "유의사항 확인" },
  { id: "subject", title: "대상자 입력" },
  { id: "career", title: "경력사항 입력" },
] as const satisfies readonly IndividualRegistrationSubjectStep[];

const defaultDuplicateCandidates = [
  {
    id: "jeon-jaejun-1",
    name: "전재준",
    gender: "male",
    birthYear: "2009",
    birthMonth: "02",
    birthDay: "10",
    address: "대전광역시 유성구 가정북로 76",
  },
  {
    id: "jeon-jaejun-2",
    name: "전재준",
    gender: "male",
    birthYear: "2009",
    birthMonth: "02",
    birthDay: "10",
    address: "대전광역시 유성구 가정북로 76",
  },
] as const satisfies readonly IndividualRegistrationDuplicateCandidate[];

function IndividualRegistrationSubject({
  title = "경력사항 개별 등록",
  steps = defaultSteps,
  currentStep = 1,
  stepLabel = "2단계 / 3단계",
  stepTitle = "대상자 입력",
  addressSearchResult = "대전광역시 유성구 가정북로 76",
  duplicateCandidates = defaultDuplicateCandidates,
  previousLabel = "이전으로",
  nextLabel = "다음으로",
  onPrevious,
  onNext,
}: IndividualRegistrationSubjectProps) {
  const titleId = useId();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [address, setAddress] = useState("");
  const [duplicateStatus, setDuplicateStatus] = useState<
    "idle" | "available" | "duplicate"
  >("idle");
  const [selectedDuplicateId, setSelectedDuplicateId] = useState("");

  const hasRequiredInformation = useMemo(
    () =>
      Boolean(name.trim()) &&
      Boolean(gender) &&
      isValidBirthDate(birthYear, birthMonth, birthDay) &&
      Boolean(address),
    [address, birthDay, birthMonth, birthYear, gender, name],
  );
  const subjectData = useMemo(
    () => ({
      name: name.trim(),
      gender: gender || "male",
      birthYear,
      birthMonth: birthMonth.padStart(2, "0"),
      birthDay: birthDay.padStart(2, "0"),
      address,
    }),
    [address, birthDay, birthMonth, birthYear, gender, name],
  ) satisfies Omit<
    IndividualRegistrationSubjectData,
    "duplicateResolution" | "existingSubjectId"
  >;
  const matchingDuplicateCandidates = useMemo(
    () => findDuplicateCandidates(subjectData, duplicateCandidates),
    [duplicateCandidates, subjectData],
  );
  const canProceed =
    hasRequiredInformation && duplicateStatus === "available" && Boolean(onNext);
  const isBirthMonthInvalid =
    birthMonth.length > 0 && !isValidBirthMonth(birthMonth);
  const maximumBirthDay = getDaysInBirthMonth(birthYear, birthMonth);
  const isBirthDayInvalid =
    birthDay.length > 0 &&
    !isValidBirthDay(birthYear, birthMonth, birthDay);

  const resetDuplicateCheck = () => {
    setDuplicateStatus("idle");
    setSelectedDuplicateId("");
  };

  const handleNameChange = (value: string) => {
    const sanitizedValue = sanitizeApplicantName(value);

    if (sanitizedValue === name) {
      return;
    }

    setName(sanitizedValue);
    resetDuplicateCheck();
  };

  const handleGenderChange = (value: string) => {
    if (value !== "male" && value !== "female") {
      return;
    }

    setGender(value);
    resetDuplicateCheck();
  };

  const handleBirthYearChange = (value: string) => {
    setBirthYear(value);
    resetDuplicateCheck();
  };

  const handleBirthMonthChange = (value: string) => {
    setBirthMonth(sanitizeDatePart(value));
    resetDuplicateCheck();
  };

  const handleBirthDayChange = (value: string) => {
    setBirthDay(sanitizeDatePart(value));
    resetDuplicateCheck();
  };

  const handleAddressSearch = () => {
    setAddress(addressSearchResult);
    resetDuplicateCheck();
  };

  const handleDuplicateCheck = () => {
    if (!hasRequiredInformation) {
      return;
    }

    if (matchingDuplicateCandidates.length > 0) {
      setDuplicateStatus("duplicate");
      setSelectedDuplicateId(matchingDuplicateCandidates[0].id);
      return;
    }

    setDuplicateStatus("available");
  };

  const handleSubmit = (
    duplicateResolution: "existing" | "new" = "new",
    existingSubjectId?: string,
  ) => {
    if (!canProceed || !gender) {
      return;
    }

    onNext?.({
      ...subjectData,
      gender,
      duplicateResolution,
      existingSubjectId,
    });
  };

  const handleDuplicateResolution = (
    resolution: "existing" | "new",
  ) => {
    if (duplicateStatus !== "duplicate" || !gender || !onNext) {
      return;
    }

    if (resolution === "existing" && !selectedDuplicateId) {
      return;
    }

    onNext({
      ...subjectData,
      gender,
      duplicateResolution: resolution,
      existingSubjectId:
        resolution === "existing" ? selectedDuplicateId : undefined,
    });
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

        <FormMainContent>
          <FormCard
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
            <FormSectionTitle>기본 정보 입력</FormSectionTitle>

            <NameAndGenderFields>
              <TextInput
                id={`${titleId}-name`}
                label="이름"
                size="large"
                autoComplete="name"
                placeholder="이름을 입력해주세요"
                value={name}
                onChange={handleNameChange}
              />

              <RadioFieldset>
                <legend>성별</legend>
                <RadioGroup
                  name={`${titleId}-gender`}
                  value={gender}
                  onChange={handleGenderChange}
                >
                  <Radio id={`${titleId}-gender-male`} value="male" size="medium">
                    남
                  </Radio>
                  <Radio
                    id={`${titleId}-gender-female`}
                    value="female"
                    size="medium"
                  >
                    여
                  </Radio>
                </RadioGroup>
              </RadioFieldset>
            </NameAndGenderFields>

            <div>
              <FieldLabel htmlFor={`${titleId}-birth-year`}>
                생년월일 (숫자만 입력해주세요)
              </FieldLabel>
              <BirthDateFields>
                <Select
                  id={`${titleId}-birth-year`}
                  size="large"
                  className={birthYear ? "completed" : undefined}
                  aria-label="출생 연도"
                  options={YEAR_OPTIONS}
                  value={birthYear}
                  onChange={handleBirthYearChange}
                />
                <TextInput
                  id={`${titleId}-birth-month`}
                  size="large"
                  aria-label="출생 월"
                  aria-invalid={isBirthMonthInvalid}
                  error={
                    isBirthMonthInvalid
                      ? "월은 1부터 12 사이로 입력해주세요."
                      : undefined
                  }
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  placeholder="월"
                  value={birthMonth}
                  onChange={handleBirthMonthChange}
                />
                <TextInput
                  id={`${titleId}-birth-day`}
                  size="large"
                  aria-label="출생 일"
                  aria-invalid={isBirthDayInvalid}
                  error={
                    isBirthDayInvalid
                      ? `일은 1부터 ${maximumBirthDay} 사이로 입력해주세요.`
                      : undefined
                  }
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  placeholder="일"
                  value={birthDay}
                  onChange={handleBirthDayChange}
                />
              </BirthDateFields>
            </div>

            <AddressFields>
              <TextInput
                id={`${titleId}-address`}
                label="주소지"
                size="large"
                placeholder="검색 버튼을 눌러주세요"
                value={address}
                disabled
              />
              <Button
                variant="secondary"
                size="large"
                type="button"
                onClick={handleAddressSearch}
              >
                검색
              </Button>
            </AddressFields>

            <DuplicateCheckArea>
              <Button
                variant="secondary"
                size="large"
                type="button"
                disabled={
                  !hasRequiredInformation || duplicateStatus === "available"
                }
                onClick={handleDuplicateCheck}
              >
                {duplicateStatus === "available" ? "확인 완료" : "중복 확인"}
              </Button>
              {duplicateStatus === "available" && (
                <span className="sr-only" aria-live="polite">
                  중복 확인이 완료되었습니다. 다음 단계로 이동할 수 있습니다.
                </span>
              )}
            </DuplicateCheckArea>
          </FormCard>

          {duplicateStatus === "duplicate" && (
            <DuplicateResultCard aria-labelledby={`${titleId}-duplicate-title`}>
              <DuplicateResultTitle id={`${titleId}-duplicate-title`}>
                중복확인
              </DuplicateResultTitle>
              <DuplicateTableFrame>
                <Table>
                  <Table.Caption className="sr-only">
                    입력 정보와 일치하는 기존 근로자 목록
                  </Table.Caption>
                  <Table.Colgroup>
                    <Table.Col width="80px" />
                    <Table.Col width="110px" />
                    <Table.Col width="170px" />
                    <Table.Col width="80px" />
                    <Table.Col width="272px" />
                  </Table.Colgroup>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th scope="col">선택</Table.Th>
                      <Table.Th scope="col">이름</Table.Th>
                      <Table.Th scope="col">생년월일</Table.Th>
                      <Table.Th scope="col">성별</Table.Th>
                      <Table.Th scope="col">주소</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {matchingDuplicateCandidates.map((candidate) => (
                      <Table.Tr key={candidate.id}>
                        <Table.Td>
                          <Radio
                            id={`${titleId}-duplicate-${candidate.id}`}
                            name={`${titleId}-duplicate-candidate`}
                            value={candidate.id}
                            checked={selectedDuplicateId === candidate.id}
                            onChange={() => setSelectedDuplicateId(candidate.id)}
                          >
                            <span className="sr-only">
                              {candidate.name} 기존 근로자 선택
                            </span>
                          </Radio>
                        </Table.Td>
                        <Table.Td>{candidate.name}</Table.Td>
                        <Table.Td>
                          {candidate.birthYear}년 {candidate.birthMonth}월{" "}
                          {candidate.birthDay}일
                        </Table.Td>
                        <Table.Td>
                          {candidate.gender === "male" ? "남" : "여"}
                        </Table.Td>
                        <Table.Td>{candidate.address}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </DuplicateTableFrame>
            </DuplicateResultCard>
          )}
        </FormMainContent>

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
          {duplicateStatus === "duplicate" ? (
            <DuplicateActionGroup>
              <Button
                variant="secondary"
                size="xlarge"
                type="button"
                disabled={!selectedDuplicateId || !onNext}
                onClick={() => handleDuplicateResolution("existing")}
              >
                기존 근로자 선택
              </Button>
              <Button
                variant="primary"
                size="xlarge"
                type="button"
                disabled={!onNext}
                onClick={() => handleDuplicateResolution("new")}
              >
                신규 근로자 추가
              </Button>
            </DuplicateActionGroup>
          ) : (
            <ButtonGroup>
              <Button
                variant="primary"
                size="xlarge"
                type="button"
                disabled={!canProceed}
                onClick={() => handleSubmit()}
              >
                {nextLabel}
              </Button>
            </ButtonGroup>
          )}
        </ActionBar>
      </FormFlow>
    </IndividualRegistrationSubjectRoot>
  );
}

export default IndividualRegistrationSubject;
