import {
  EARLIEST_BIRTH_YEAR,
  LATEST_BIRTH_YEAR,
} from "./CareerCertificateIssue.constants";

const DATE_PART_PATTERN = /^\d{1,2}$/;

export const sanitizeApplicantName = (value: string) =>
  value.replace(/[0-9]/g, "");

export const sanitizeDatePart = (value: string) =>
  value.replace(/[^0-9]/g, "").slice(0, 2);

export const isValidBirthYear = (value: string) => {
  const year = Number(value);

  return (
    /^\d{4}$/.test(value) &&
    year >= EARLIEST_BIRTH_YEAR &&
    year <= LATEST_BIRTH_YEAR
  );
};

export const isValidBirthMonth = (value: string) => {
  const month = Number(value);

  return DATE_PART_PATTERN.test(value) && month >= 1 && month <= 12;
};

export const getDaysInBirthMonth = (year: string, month: string) => {
  if (!isValidBirthYear(year) || !isValidBirthMonth(month)) {
    return 31;
  }

  return new Date(Number(year), Number(month), 0).getDate();
};

export const isValidBirthDay = (
  year: string,
  month: string,
  value: string,
) => {
  const day = Number(value);

  return (
    DATE_PART_PATTERN.test(value) &&
    day >= 1 &&
    day <= getDaysInBirthMonth(year, month)
  );
};

export const isValidBirthDate = (
  year: string,
  month: string,
  day: string,
) =>
  isValidBirthYear(year) &&
  isValidBirthMonth(month) &&
  isValidBirthDay(year, month, day);
