import type { CareerEditReason, CareerEditTarget } from "./CareerEdit.types";

export const CAREER_EDIT_STEPS = [
  { id: "notice", step: "1단계", title: "유의사항" },
  { id: "reason", step: "2단계", title: "수정 사유" },
  { id: "applicant", step: "3단계", title: "대상자 확인" },
  { id: "career", step: "4단계", title: "수정 대상" },
  { id: "details", step: "5단계", title: "정보 수정" },
] as const;

export const CAREER_EDIT_STAGE_TITLES = [
  "유의사항 확인",
  "수정 사유 입력",
  "수정 대상자 확인",
  "수정 대상 선택",
  "수정할 데이터 입력",
] as const;

export const CAREER_EDIT_REASON_OPTIONS = [
  { value: "visit", label: "민원인 정정 청구 (방문)" },
  { value: "phone", label: "민원인 정정 청구 (전화)" },
  { value: "email", label: "민원인 정정 청구 (전자우편)" },
  { value: "other", label: "기타 사유" },
] as const satisfies readonly {
  value: CareerEditReason;
  label: string;
}[];

export const CAREER_EDIT_TARGET_OPTIONS = [
  { value: "personal", label: "인적 사항 수정" },
  { value: "career", label: "경력 사항 수정" },
] as const satisfies readonly {
  value: CareerEditTarget;
  label: string;
}[];

