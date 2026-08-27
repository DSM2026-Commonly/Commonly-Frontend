import {
  CareerCertificateIssue,
  useAuthSession,
  type CareerCertificateApplicationData,
  type CertificateCareerRow,
} from "@commonly/ui";
import {
  downloadCertificate,
  fetchSelfCertificates,
  getAuthToken,
  issueSelfCertificate,
  saveBlobAsFile,
  type IssuedCertificate,
} from "@commonly/utils";
import { useRef } from "react";

function CareerCertificateIssuePage() {
  const { session } = useAuthSession();
  const issuedRef = useRef<IssuedCertificate | null>(null);

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

  const handleComplete = async (data: CareerCertificateApplicationData) => {
    const certificateIds = data.selectedCareerIds.map(Number);

    if (
      certificateIds.length === 0 ||
      certificateIds.some((id) => !Number.isInteger(id) || id <= 0)
    ) {
      throw new Error("발급할 경력 사항을 선택해 주세요.");
    }

    issuedRef.current = await issueSelfCertificate(
      {
        // 전체 발급은 서버가 본인 전체 경력을 대상으로 하므로 선택 발급일 때만 id 를 보낸다.
        ...(data.issueType === "selected" ? { certificateIds } : {}),
        purpose: data.purpose,
        otherMatters: data.additionalNote,
      },
      { token: getAuthToken() },
    );
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
    />
  );
}

export default CareerCertificateIssuePage;
