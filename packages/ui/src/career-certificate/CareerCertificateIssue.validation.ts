import {
  EARLIEST_BIRTH_YEAR,
  LATEST_BIRTH_YEAR,
  MAX_ISSUE_CAREER_COUNT,
} from "./CareerCertificateIssue.constants";
import type { CertificateIssueType } from "./CareerCertificateIssue.types";

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

/**
 * 발급 4단계 신청 버튼이 막힌 이유 중 경력 선택에 관한 안내. 없으면 빈 문자열이다.
 * 10건 초과는 발급유형 아래 오류 문구로 따로 알린다.
 * 민원인은 본인 목록을 못 불러와도 서버가 본인 전체로 발급하므로 0건이어도 막히지 않는다.
 */
export const getCareerSelectionHint = ({
  variant,
  issueType,
  careerRowCount,
  selectedCount,
}: {
  variant: "staff" | "civil";
  issueType: "all" | "selected";
  careerRowCount: number;
  selectedCount: number;
}): string => {
  if (careerRowCount === 0) {
    return variant === "staff"
      ? "발급할 경력 사항이 없습니다. 경력 사항을 먼저 등록해 주세요."
      : "";
  }

  if (issueType === "selected" && selectedCount === 0) {
    return "발급할 경력을 1건 이상 선택해 주세요.";
  }

  return "";
};

/** 발급 4단계에서 아직 입력하지 않은 필수 항목의 라벨. 발급 용도는 증명서에 기재된다. */
export const getMissingCertificateDetailsFields = (purpose: string): string[] =>
  purpose.trim().length > 0 ? [] : ["용도"];

/**
 * 발급할 경력 수가 서식 한도 안에 드는지.
 * 전체 발급은 불러온 경력 전체가 10건 이하, 선택 발급은 고른 경력이 1~10건이어야 한다.
 */
export const isCareerSelectionWithinLimit = (
  issueType: CertificateIssueType,
  careerRowCount: number,
  selectedCount: number,
) =>
  issueType === "all"
    ? careerRowCount <= MAX_ISSUE_CAREER_COUNT
    : selectedCount > 0 && selectedCount <= MAX_ISSUE_CAREER_COUNT;

/**
 * 같은 대상자의 경력을 다시 불러왔을 때 기존 선택 중 새 목록에 남아 있는 것만 고른다.
 * 사라진 경력 id 를 남겨 두면 미리보기엔 없는 경력이 발급 요청에 들어간다.
 */
export const retainAvailableCareerIds = (
  selectedIds: readonly string[],
  rowIds: readonly string[],
): string[] => {
  const available = new Set(rowIds);

  return selectedIds.filter((id) => available.has(id));
};

/**
 * 실제로 발급되는 구분. 민원인이 경력 목록 없이(조회 실패) 선택 발급을 고르면
 * 보낼 경력이 없어 본인 전체로 발급되므로 전체 발급이다.
 */
export const resolveIssuedIssueType = (
  issueType: CertificateIssueType,
  careerRowCount: number,
): CertificateIssueType =>
  issueType === "selected" && careerRowCount === 0 ? "all" : issueType;

export const isValidBirthDate = (
  year: string,
  month: string,
  day: string,
) =>
  isValidBirthYear(year) &&
  isValidBirthMonth(month) &&
  isValidBirthDay(year, month, day);
