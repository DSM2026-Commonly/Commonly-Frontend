import { Button, Radio, Select, Table, TextInput } from "krds-react";
import { YEAR_OPTIONS } from "../CareerCertificateIssue.constants";
import {
  getDaysInBirthMonth,
  isValidBirthDay,
  isValidBirthMonth,
} from "../CareerCertificateIssue.validation";
import {
  CardStack,
  CardTitle,
  DateFields,
  FieldGroup,
  FieldLabel,
  FormCard,
  SearchAction,
  TableFrame,
} from "./ApplicantStep.styles";

interface ApplicantStepProps {
  applicantName: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  canSearch: boolean;
  hasSearchResult: boolean;
  selectedPerson: string;
  onApplicantNameChange: (value: string) => void;
  onBirthYearChange: (value: string) => void;
  onBirthMonthChange: (value: string) => void;
  onBirthDayChange: (value: string) => void;
  onSearch: () => void;
  onSelectedPersonChange: (personId: string) => void;
}

function ApplicantStep({
  applicantName,
  birthYear,
  birthMonth,
  birthDay,
  canSearch,
  hasSearchResult,
  selectedPerson,
  onApplicantNameChange,
  onBirthYearChange,
  onBirthMonthChange,
  onBirthDayChange,
  onSearch,
  onSelectedPersonChange,
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
        <FieldGroup>
          <TextInput
            id="certificate-applicant-name"
            label="이름"
            placeholder="이름을 입력해주세요"
            value={applicantName}
            onChange={onApplicantNameChange}
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>생년월일 (숫자만 입력해주세요)</FieldLabel>
          <DateFields>
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
          </DateFields>
        </FieldGroup>
        <SearchAction>
          <Button
            variant="secondary"
            size="large"
            disabled={!canSearch}
            onClick={onSearch}
          >
            대상자 조회
          </Button>
        </SearchAction>
      </FormCard>

      {hasSearchResult && (
        <FormCard>
          <CardTitle>대상자 선택</CardTitle>
          <TableFrame>
            <Table>
              <Table.Caption className="sr-only">
                경력증명서 발급 대상자 목록
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
                <Table.Tr>
                  <Table.Td>
                    <Radio
                      id="certificate-person-jeon-jaejun"
                      name="certificate-person"
                      value="jeon-jaejun"
                      checked={selectedPerson === "jeon-jaejun"}
                      onChange={() => onSelectedPersonChange("jeon-jaejun")}
                    >
                      <span className="sr-only">전재준 선택</span>
                    </Radio>
                  </Table.Td>
                  <Table.Td>전재준</Table.Td>
                  <Table.Td>2009년 02월 10일</Table.Td>
                  <Table.Td>대전광역시 유성구 가정북로 76</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </TableFrame>
        </FormCard>
      )}
    </CardStack>
  );
}

export default ApplicantStep;
