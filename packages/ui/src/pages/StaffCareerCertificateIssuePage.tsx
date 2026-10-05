import {
  clearIssuedCertificateSession,
  downloadCertificate,
  fetchCertificateDetail,
  fetchHumanCertificates,
  getAuthToken,
  getIssuedCertificateSession,
  issueCertificate,
  saveBlobAsFile,
  searchHumans,
  setIssuedCertificateSession,
  type HumanCertificate,
} from "@commonly/utils";
import { useRef } from "react";
import { useNavigate } from "react-router";
import CareerCertificateIssue from "../career-certificate/CareerCertificateIssue";
import type {
  CareerCertificateApplicationData,
  CertificateApplicant,
  CertificateCareerRow,
  IssuedCertificateSummary,
  RestoredIssuedCertificate,
} from "../career-certificate/CareerCertificateIssue.types";

interface IssuedCertificateRef {
  certificateId: number;
  documentNo: string;
  humanName: string;
}

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
  };
}

/** admin-web/user-web 이 공유하는 직원용 경력증명서 발급 페이지. */
function StaffCareerCertificateIssuePage() {
  const navigate = useNavigate();
  // 검색은 부분 일치라 입력한 이름과 실제 성명이 다를 수 있어 id→실명을 보존한다.
  const humanNamesRef = useRef(new Map<string, string>());
  const issuedRef = useRef<IssuedCertificateRef | null>(null);

  const handleSearchApplicants = async ({
    name,
    birthDate,
  }: {
    name: string;
    birthDate: string;
  }): Promise<readonly CertificateApplicant[]> => {
    const humans = await searchHumans(
      { name, birthDateFrom: birthDate, birthDateTo: birthDate },
      { token: getAuthToken() },
    );

    humanNamesRef.current = new Map(
      humans.map((human) => [String(human.humanId), human.name]),
    );

    return humans.map((human) => ({
      id: String(human.humanId),
      name: human.name,
      birthDate: human.birthDate,
      address: human.address,
    }));
  };

  const handleLoadCareerRows = async (
    applicantId: string,
  ): Promise<readonly CertificateCareerRow[]> => {
    const humanId = Number(applicantId);

    if (!Number.isInteger(humanId) || humanId <= 0) {
      throw new Error("대상자 정보가 올바르지 않습니다. 다시 조회해 주세요.");
    }

    const certificates = await fetchHumanCertificates(humanId, {
      token: getAuthToken(),
    });

    if (certificates.length === 0) {
      throw new Error("대상자의 경력 사항이 없습니다. 대상자를 확인해 주세요.");
    }

    return certificates.map(toCareerRow);
  };

  const handleComplete = async (
    data: CareerCertificateApplicationData,
  ): Promise<IssuedCertificateSummary> => {
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

    const issued = await issueCertificate(
      {
        humanId,
        certificateIds,
        purpose: data.purpose,
        otherMatters: data.additionalNote,
      },
      { token: getAuthToken() },
    );

    issuedRef.current = {
      certificateId: issued.certificateId,
      documentNo: issued.documentNo,
      humanName:
        humanNamesRef.current.get(data.applicantId) ?? data.applicantName,
    };
    // 새로고침해도 방금 발급한 증명서를 다시 내려받을 수 있게 보관한다.
    setIssuedCertificateSession({
      certificateId: issued.certificateId,
      issueType: data.issueType,
    });

    return {
      documentNo: issued.documentNo,
      issuedAt: await loadIssuedAt(issued.certificateId),
    };
  };

  const handleRestoreIssued =
    async (): Promise<RestoredIssuedCertificate | null> => {
      const session = getIssuedCertificateSession();

      if (!session) {
        return null;
      }

      try {
        const detail = await fetchCertificateDetail(session.certificateId, {
          token: getAuthToken(),
        });
        const humanName = detail.human?.name ?? "";

        issuedRef.current = {
          certificateId: detail.certificateId,
          documentNo: detail.documentNo,
          humanName,
        };

        return {
          applicantName: humanName,
          issueType: session.issueType,
          documentNo: detail.documentNo,
          issuedAt: detail.issuedAt,
        };
      } catch {
        // 삭제됐거나 조회할 수 없는 발급 건이면 보관값을 버리고 처음부터 시작한다.
        clearIssuedCertificateSession();
        return null;
      }
    };

  const handleRestart = () => {
    clearIssuedCertificateSession();
    issuedRef.current = null;
  };

  const handleDownload = async () => {
    const issued = issuedRef.current;

    if (!issued) {
      throw new Error("발급된 증명서 정보를 찾을 수 없습니다. 다시 발급해 주세요.");
    }

    const blob = await downloadCertificate(issued.certificateId, {
      token: getAuthToken(),
    });
    const namePart = issued.humanName ? `_${issued.humanName}` : "";

    saveBlobAsFile(
      blob,
      `유성구청${namePart}_경력증명서_${issued.documentNo}.pdf`,
    );
  };

  return (
    <CareerCertificateIssue
      onCancel={() => void navigate("/")}
      onSearchApplicants={handleSearchApplicants}
      onLoadCareerRows={handleLoadCareerRows}
      onComplete={handleComplete}
      onDownload={handleDownload}
      onRestoreIssued={handleRestoreIssued}
      onRestart={handleRestart}
    />
  );
}

/** 발급일은 발급 응답에 없어 상세로 한 번 더 확인한다. 실패해도 발급 자체는 성공이다. */
async function loadIssuedAt(certificateId: number): Promise<string> {
  try {
    const detail = await fetchCertificateDetail(certificateId, {
      token: getAuthToken(),
    });

    return detail.issuedAt;
  } catch {
    return "";
  }
}

export default StaffCareerCertificateIssuePage;
