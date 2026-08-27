import type { CareerCertificateIssueView } from "./CareerCertificateIssue.types";

export const STEP_VIEWS: CareerCertificateIssueView[] = [
  "notice",
  "reason",
  "applicant",
  "details",
];

export const STEP_INDICATOR_ITEMS = [
  { id: "notice", step: "1단계", title: "유의사항 확인" },
  { id: "reason", step: "2단계", title: "발급 사유 입력" },
  { id: "applicant", step: "3단계", title: "대상자 입력" },
  { id: "details", step: "4단계", title: "발급 정보 선택" },
];

export const STEP_TITLES = [
  "유의사항 확인",
  "발급 사유 입력",
  "대상자 입력",
  "발급 정보 선택",
];

export const REASON_OPTIONS = [
  { value: "visit", label: "민원인 발급 신청 (방문)" },
  { value: "phone", label: "민원인 발급 신청 (전화)" },
  { value: "email", label: "민원인 발급 신청 (전자우편)" },
  { value: "other", label: "기타 사유" },
];

// 하드코딩하면 해가 바뀔 때 당해 연도 선택이 불가능해지므로 현재 연도로 계산한다.
// (근무 기간 입력도 이 옵션을 공유한다.)
export const LATEST_BIRTH_YEAR = new Date().getFullYear();
export const EARLIEST_BIRTH_YEAR = 1900;

export const YEAR_OPTIONS = [
  { value: "", label: "년도" },
  ...Array.from(
    { length: LATEST_BIRTH_YEAR - EARLIEST_BIRTH_YEAR + 1 },
    (_, index) => {
      const year = String(LATEST_BIRTH_YEAR - index);

      return { value: year, label: year };
    },
  ),
];

export const getStepIndex = (view: CareerCertificateIssueView) => {
  const index = STEP_VIEWS.indexOf(view);

  return index < 0 ? 0 : index;
};
