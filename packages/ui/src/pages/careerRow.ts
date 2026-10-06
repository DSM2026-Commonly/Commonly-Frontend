import type { HumanCertificate } from "@commonly/utils";
import type { CertificateCareerRow } from "../career-certificate/CareerCertificateIssue.types";

/**
 * 경력 목록 응답 한 줄을 미리보기 표의 한 행으로 바꾼다.
 * 근무부서는 `department` 다. `division` 은 구분(채용/전보/해지/퇴직)이라 이 칸에 넣으면 안 된다.
 */
export function toCareerRow(certificate: HumanCertificate): CertificateCareerRow {
  // 퇴직일·만료일이 모두 없으면 재직 중이므로 끝이 비어 보이지 않게 "현재"로 표기한다.
  const endDate = certificate.retirementDate || certificate.expirationDate;

  return {
    id: String(certificate.certificateId),
    job: certificate.keyResponsibilities,
    department: certificate.department,
    period: `${certificate.hireDate} ~ ${endDate || "현재"}`,
    startDate: certificate.hireDate,
    endDate,
    reason: certificate.reason,
  };
}
