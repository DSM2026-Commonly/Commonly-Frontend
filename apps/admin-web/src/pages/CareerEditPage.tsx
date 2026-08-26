import {
  CareerEdit,
  type CareerEditApplicant,
  type CareerEditRecord,
  type CareerEditSubmission,
} from "@commonly/ui";
import {
  fetchHumanCertificates,
  getAuthToken,
  searchHumans,
  updateCertificate,
  updateHuman,
  type HumanCertificate,
} from "@commonly/utils";
import { useRef } from "react";
import { useNavigate } from "react-router";

function toIsoDate(value: string): string {
  const [year = "", month = "", day = ""] = value.match(/\d+/g) ?? [];

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function toApiGender(gender: CareerEditApplicant["gender"]): "M" | "F" | "" {
  if (gender === "male") {
    return "M";
  }

  return gender === "female" ? "F" : "";
}

function CareerEditPage() {
  const navigate = useNavigate();
  const navigateHome = () => void navigate("/");
  // 경력 수정 PUT은 12필드 전체를 요구하므로, 화면에 노출하지 않는
  // employmentType/expirationDate 원본을 목록 조회 결과에서 보존한다.
  const certificatesRef = useRef(new Map<string, HumanCertificate>());

  const handleSearch = async (query: {
    name: string;
    birthDate: string;
  }): Promise<readonly CareerEditApplicant[]> => {
    const humans = await searchHumans(
      {
        name: query.name,
        birthDateFrom: query.birthDate,
        birthDateTo: query.birthDate,
      },
      { token: getAuthToken() },
    );

    return humans.map((human) => ({
      id: String(human.humanId),
      name: human.name,
      birthDate: human.birthDate,
      address: human.address,
      gender:
        human.gender === "M"
          ? ("male" as const)
          : human.gender === "F"
            ? ("female" as const)
            : undefined,
    }));
  };

  const handleLoadCareerRecords = async (
    applicantId: string,
  ): Promise<readonly CareerEditRecord[]> => {
    const humanId = Number(applicantId);

    if (!Number.isInteger(humanId) || humanId <= 0) {
      throw new Error("대상자 정보가 올바르지 않습니다. 다시 조회해 주세요.");
    }

    const certificates = await fetchHumanCertificates(humanId, {
      token: getAuthToken(),
    });

    certificatesRef.current = new Map(
      certificates.map((certificate) => [
        String(certificate.certificateId),
        certificate,
      ]),
    );

    return certificates.map((certificate) => ({
      id: String(certificate.certificateId),
      position: "",
      duties: certificate.keyResponsibilities,
      department: certificate.division,
      startDate: certificate.hireDate.replaceAll("-", "."),
      endDate: certificate.retirementDate.replaceAll("-", "."),
      retirementReason: certificate.reason,
      note: certificate.note,
    }));
  };

  const handleComplete = async (submission: CareerEditSubmission) => {
    const token = getAuthToken();

    if (submission.editTarget === "personal") {
      const humanId = Number(submission.applicant.id);

      if (!Number.isInteger(humanId) || humanId <= 0) {
        throw new Error("대상자 정보가 올바르지 않습니다. 다시 조회해 주세요.");
      }

      const { personalInfo } = submission;

      await updateHuman(
        {
          humanId,
          name: personalInfo.name,
          gender: personalInfo.gender === "male" ? "M" : "F",
          birthDate: `${personalInfo.birthYear}-${personalInfo.birthMonth.padStart(2, "0")}-${personalInfo.birthDay.padStart(2, "0")}`,
          address: personalInfo.address || null,
        },
        { token },
      );
      return;
    }

    const certificateId = Number(submission.record.id);

    if (!Number.isInteger(certificateId) || certificateId <= 0) {
      throw new Error("경력 정보가 올바르지 않습니다. 다시 시도해 주세요.");
    }

    const original = certificatesRef.current.get(submission.record.id);

    if (!original) {
      throw new Error("원본 경력 정보를 찾을 수 없습니다. 다시 시도해 주세요.");
    }

    const { record, applicant } = submission;

    await updateCertificate(
      certificateId,
      {
        name: applicant.name,
        birthDate: toIsoDate(applicant.birthDate),
        gender: toApiGender(applicant.gender),
        jobTitle: record.position,
        keyResponsibilities: record.duties,
        hireDate: toIsoDate(record.startDate),
        expirationDate: original.expirationDate,
        retirementDate: record.endDate ? toIsoDate(record.endDate) : "",
        division: record.department,
        reason: record.retirementReason,
        employmentType: original.employmentType,
        note: record.note,
      },
      { token },
    );
  };

  return (
    <CareerEdit
      onCancel={navigateHome}
      onHome={navigateHome}
      onSearch={handleSearch}
      onLoadCareerRecords={handleLoadCareerRecords}
      onComplete={handleComplete}
    />
  );
}

export default CareerEditPage;
