import { isValidBirthDate } from "../career-certificate/CareerCertificateIssue.validation";
import { hasAllDateParts } from "../form/requiredFields.utils";
import type {
  CareerEditPersonalInfo,
  CareerEditRecord,
} from "./CareerEdit.types";

export interface BirthDateParts {
  year: string;
  month: string;
  day: string;
}

export function getBirthDateParts(value: string | undefined): BirthDateParts {
  const [year = "", month = "", day = ""] = value?.match(/\d+/g) ?? [];

  return { year, month, day };
}

export function getEditableDateParts(value: string): BirthDateParts {
  if (!value.includes(".")) {
    return getBirthDateParts(value);
  }

  const [year = "", month = "", day = ""] = value.split(".");

  return { year, month, day };
}

export function isValidEditableDate(value: string) {
  const { year, month, day } = getEditableDateParts(value);

  return isValidBirthDate(year, month, day);
}

// 재직 중 경력은 종료일이 비어 있으므로 "모든 부분이 빈 날짜"를 구분한다.
export function isEmptyEditableDate(value: string) {
  const { year, month, day } = getEditableDateParts(value);

  return !year && !month && !day;
}

function hasAllEditableDateParts(value: string) {
  const { year, month, day } = getEditableDateParts(value);

  return hasAllDateParts(year, month, day);
}

/** 연·월·일 중 일부만 입력한 날짜. 비워 둘 수 있는 종료일도 시작했으면 끝까지 채워야 한다. */
export function isPartialEditableDate(value: string) {
  return !isEmptyEditableDate(value) && !hasAllEditableDateParts(value);
}

/**
 * 인적 사항 수정에서 아직 입력하지 않은 필수 항목의 라벨.
 * 입력했지만 형식이 틀린 생년월일은 입력란 아래 오류 문구로 알리므로 넣지 않는다.
 */
export function getMissingPersonalInfoFields(
  personalInfo: CareerEditPersonalInfo,
) {
  const missingFields: string[] = [];

  if (!personalInfo.name.trim()) {
    missingFields.push("이름");
  }

  if (!personalInfo.gender) {
    missingFields.push("성별");
  }

  if (
    !hasAllDateParts(
      personalInfo.birthYear,
      personalInfo.birthMonth,
      personalInfo.birthDay,
    )
  ) {
    missingFields.push("생년월일");
  }

  if (!personalInfo.address.trim()) {
    missingFields.push("주소지");
  }

  return missingFields;
}

export function isPersonalInfoSavable(personalInfo: CareerEditPersonalInfo) {
  return (
    getMissingPersonalInfoFields(personalInfo).length === 0 &&
    isValidBirthDate(
      personalInfo.birthYear,
      personalInfo.birthMonth,
      personalInfo.birthDay,
    )
  );
}

/**
 * 경력 사항 수정에서 아직 입력하지 않은 필수 항목의 라벨.
 * 종료일은 재직 중이면 비워 둘 수 있어 넣지 않는다.
 */
export function getMissingCareerRecordFields(record: CareerEditRecord) {
  const missingFields: string[] = [];

  if (!record.position.trim()) {
    missingFields.push("직종명");
  }

  if (!record.duties.trim()) {
    missingFields.push("담당업무");
  }

  if (!record.department.trim()) {
    missingFields.push("근무부서");
  }

  if (!hasAllEditableDateParts(record.startDate)) {
    missingFields.push("근무 시작일");
  }

  return missingFields;
}

export function isCareerRecordSavable(record: CareerEditRecord) {
  return (
    getMissingCareerRecordFields(record).length === 0 &&
    isValidEditableDate(record.startDate) &&
    // 재직 중(퇴직일 없음) 경력은 종료일을 비워둔 채 저장할 수 있어야 한다.
    (isEmptyEditableDate(record.endDate) ||
      isValidEditableDate(record.endDate))
  );
}
