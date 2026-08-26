import {
  CareerCertificateIssue,
  type CareerCertificateApplicationData,
  type CertificateApplicant,
  type CertificateCareerRow,
} from "@commonly/ui";
import {
  downloadCertificate,
  fetchHumanCertificates,
  getAuthToken,
  issueCertificate,
  saveBlobAsFile,
  searchHumans,
  type IssuedCertificate,
} from "@commonly/utils";
import { useRef } from "react";
import { useNavigate } from "react-router";

function CareerCertificateIssuePage() {
  const navigate = useNavigate();
  // 검색은 부분 일치라 입력한 이름과 실제 성명이 다를 수 있어 id→실명을 보존한다.
  const humanNamesRef = useRef(new Map<string, string>());
  const issuedRef = useRef<(IssuedCertificate & { humanName: string }) | null>(
    null,
  );

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

    return certificates.map((certificate) => ({
      id: String(certificate.certificateId),
      job: certificate.keyResponsibilities,
      department: certificate.division,
      period: `${certificate.hireDate} ~ ${certificate.retirementDate || certificate.expirationDate}`,
    }));
  };

  const handleComplete = async (data: CareerCertificateApplicationData) => {
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
      ...issued,
      humanName: humanNamesRef.current.get(data.applicantId) ?? data.applicantName,
    };
  };

  const handleDownload = async () => {
    const issued = issuedRef.current;

    if (!issued) {
      throw new Error("발급된 증명서 정보를 찾을 수 없습니다. 다시 발급해 주세요.");
    }

    const blob = await downloadCertificate(issued.certificateId, {
      token: getAuthToken(),
    });

    saveBlobAsFile(
      blob,
      `유성구청_${issued.humanName}_경력증명서_${issued.documentNo}.pdf`,
    );
  };

  return (
    <CareerCertificateIssue
      onCancel={() => void navigate("/")}
      onSearchApplicants={handleSearchApplicants}
      onLoadCareerRows={handleLoadCareerRows}
      onComplete={handleComplete}
      onDownload={handleDownload}
    />
  );
}

export default CareerCertificateIssuePage;
