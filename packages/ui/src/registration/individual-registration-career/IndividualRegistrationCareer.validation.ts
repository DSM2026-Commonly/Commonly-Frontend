import { isValidBirthDate } from "../../career-certificate/CareerCertificateIssue.validation";
import { hasAllDateParts } from "../../form/requiredFields.utils";
import type { IndividualRegistrationCareerData } from "./IndividualRegistrationCareer";

const toComparableDate = (year: string, month: string, day: string) =>
  `${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`;

export const isValidCareerDateRange = (
  startYear: string,
  startMonth: string,
  startDay: string,
  endYear: string,
  endMonth: string,
  endDay: string,
) =>
  toComparableDate(startYear, startMonth, startDay) <=
  toComparableDate(endYear, endMonth, endDay);

/**
 * 아직 입력하지 않은 필수 항목의 라벨.
 * 입력했지만 형식이 틀린 날짜는 입력란 아래 오류 문구로 알리므로 넣지 않는다.
 */
export const getMissingCareerFields = (
  career: IndividualRegistrationCareerData,
) => {
  const missingFields: string[] = [];

  if (!career.jobTitle.trim()) {
    missingFields.push("직종명");
  }

  if (!career.duties.trim()) {
    missingFields.push("담당업무");
  }

  if (!career.department.trim()) {
    missingFields.push("근무부서");
  }

  if (!hasAllDateParts(career.startYear, career.startMonth, career.startDay)) {
    missingFields.push("근무 시작일");
  }

  if (!hasAllDateParts(career.endYear, career.endMonth, career.endDay)) {
    missingFields.push("근무 종료일");
  }

  if (!career.resignationReason.trim()) {
    missingFields.push("퇴직 사유");
  }

  return missingFields;
};

const hasValidCareerDates = (career: IndividualRegistrationCareerData) =>
  isValidBirthDate(career.startYear, career.startMonth, career.startDay) &&
  isValidBirthDate(career.endYear, career.endMonth, career.endDay);

const isCareerDateRangeInOrder = (career: IndividualRegistrationCareerData) =>
  isValidCareerDateRange(
    career.startYear,
    career.startMonth,
    career.startDay,
    career.endYear,
    career.endMonth,
    career.endDay,
  );

/** 근무 시작일과 종료일이 모두 올바른 날짜인데 종료일이 시작일보다 빠른지. */
export const isCareerDateRangeReversed = (
  career: IndividualRegistrationCareerData,
) => hasValidCareerDates(career) && !isCareerDateRangeInOrder(career);

export const canSubmitCareer = (career: IndividualRegistrationCareerData) =>
  getMissingCareerFields(career).length === 0 &&
  hasValidCareerDates(career) &&
  isCareerDateRangeInOrder(career);
