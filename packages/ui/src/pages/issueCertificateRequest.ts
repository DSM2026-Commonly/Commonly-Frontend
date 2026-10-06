import type { IssueCertificateRequest } from "@commonly/utils";
import { REASON_OPTIONS } from "../career-certificate/CareerCertificateIssue.constants";
import type { CareerCertificateApplicationData } from "../career-certificate/CareerCertificateIssue.types";

/** 2단계 발급 사유. 고른 사유 이름과 상세 내용을 합쳐 발급 이력에 남긴다. */
export function formatIssueReason(reason: string, note: string): string {
  const label =
    REASON_OPTIONS.find((option) => option.value === reason)?.label ?? "";

  return [label, note.trim()].filter(Boolean).join(" - ");
}

/**
 * 화면 입력을 발급·미리보기 공통 요청 본문으로 바꾼다. 두 API 가 같은 본문을 받으므로 검증도 여기서 한 번만 한다.
 */
export function toIssueCertificateRequest(
  data: CareerCertificateApplicationData,
): IssueCertificateRequest {
  const humanId = Number(data.applicantId);
  const certificateIds = data.selectedCareerIds.map(Number);

  if (
    !Number.isInteger(humanId) ||
    humanId <= 0 ||
    certificateIds.length === 0 ||
    certificateIds.some((id) => !Number.isInteger(id) || id <= 0)
  ) {
    throw new Error(
      "발급 대상 정보가 올바르지 않습니다. 대상자를 다시 조회해 주세요.",
    );
  }

  const issueReason = formatIssueReason(data.reason, data.note);

  return {
    humanId,
    certificateIds,
    purpose: data.purpose,
    otherMatters: data.additionalNote,
    ...(issueReason ? { issueReason } : {}),
  };
}
