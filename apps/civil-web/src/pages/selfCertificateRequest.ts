import type { CareerCertificateApplicationData } from "@commonly/ui";
import type { IssueSelfCertificateRequest } from "@commonly/utils";

/**
 * 화면 입력을 본인 발급·본인 미리보기 공통 요청 본문으로 바꾼다.
 * 선택 발급일 때만 고른 경력을 보내고, 전체 발급이면 생략해 서버가 본인 전체로 발급하게 한다.
 */
export function toSelfCertificateRequest(
  data: CareerCertificateApplicationData,
): IssueSelfCertificateRequest {
  const request: IssueSelfCertificateRequest = {
    purpose: data.purpose,
    otherMatters: data.additionalNote,
  };

  if (data.issueType !== "selected" || data.selectedCareerIds.length === 0) {
    return request;
  }

  const certificateIds = data.selectedCareerIds.map(Number);

  if (certificateIds.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new Error("발급할 경력 정보가 올바르지 않습니다. 다시 신청해 주세요.");
  }

  return { ...request, certificateIds };
}
