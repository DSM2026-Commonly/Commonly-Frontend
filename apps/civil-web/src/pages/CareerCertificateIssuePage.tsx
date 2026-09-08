import {
  CareerCertificateIssue,
  useAuthSession,
  type CareerCertificateApplicationData,
  type CertificateCareerRow,
  type IssuedCertificateSummary,
  type RestoredIssuedCertificate,
} from "@commonly/ui";
import {
  clearIssuedCertificateSession,
  downloadCertificate,
  fetchCertificateDetail,
  fetchSelfCertificates,
  getAuthToken,
  getIssuedCertificateSession,
  issueSelfCertificate,
  saveBlobAsFile,
  setIssuedCertificateSession,
} from "@commonly/utils";
import { useRef } from "react";

interface IssuedCertificateRef {
  certificateId: number;
  documentNo: string;
}

function CareerCertificateIssuePage() {
  const { session } = useAuthSession();
  const issuedRef = useRef<IssuedCertificateRef | null>(null);

  // 민원인은 로그인 토큰으로 본인이 정해지므로 대상자 id 없이 본인 경력을 조회한다.
  const handleLoadCareerRows = async (): Promise<
    readonly CertificateCareerRow[]
  > => {
    const certificates = await fetchSelfCertificates({
      token: getAuthToken(),
    });

    if (certificates.length === 0) {
      throw new Error(
        "조회된 경력 사항이 없습니다. 근로 내역이 없는 경우 042-611-2114로 문의해 주세요.",
      );
    }

    return certificates.map((certificate) => ({
      id: String(certificate.certificateId),
      job: certificate.keyResponsibilities,
      department: certificate.division,
      period: `${certificate.hireDate} ~ ${certificate.retirementDate || certificate.expirationDate}`,
    }));
  };

  const handleComplete = async (
    data: CareerCertificateApplicationData,
  ): Promise<IssuedCertificateSummary> => {
    const certificateIds = data.selectedCareerIds.map(Number);

    if (
      certificateIds.length === 0 ||
      certificateIds.some((id) => !Number.isInteger(id) || id <= 0)
    ) {
      throw new Error("발급할 경력 사항을 선택해 주세요.");
    }

    const issued = await issueSelfCertificate(
      {
        // 전체 발급은 서버가 본인 전체 경력을 대상으로 하므로 선택 발급일 때만 id 를 보낸다.
        ...(data.issueType === "selected" ? { certificateIds } : {}),
        purpose: data.purpose,
        otherMatters: data.additionalNote,
      },
      { token: getAuthToken() },
    );

    issuedRef.current = {
      certificateId: issued.certificateId,
      documentNo: issued.documentNo,
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
      const storedSession = getIssuedCertificateSession();

      if (!storedSession) {
        return null;
      }

      try {
        const detail = await fetchCertificateDetail(
          storedSession.certificateId,
          { token: getAuthToken() },
        );

        issuedRef.current = {
          certificateId: detail.certificateId,
          documentNo: detail.documentNo,
        };

        return {
          applicantName: detail.human?.name ?? session?.name ?? "",
          issueType: storedSession.issueType,
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
    const namePart = session?.name ? `_${session.name}` : "";

    saveBlobAsFile(
      blob,
      `유성구청${namePart}_경력증명서_${issued.documentNo}.pdf`,
    );
  };

  return (
    <CareerCertificateIssue
      variant="civil"
      applicantName={session?.name ?? ""}
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

export default CareerCertificateIssuePage;
