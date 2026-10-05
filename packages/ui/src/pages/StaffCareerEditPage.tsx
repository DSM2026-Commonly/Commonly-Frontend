import {
  deleteHuman,
  fetchHumanCertificates,
  getAuthToken,
  searchHumansPaged,
  updateCertificate,
  updateHuman,
  type HumanCertificate,
} from "@commonly/utils";
import { useRef } from "react";
import { useNavigate } from "react-router";
import CareerEdit from "../career-edit/CareerEdit";
import { searchRoadAddresses } from "../registration/address-search/searchRoadAddresses";
import type {
  CareerEditApplicant,
  CareerEditRecord,
  CareerEditSubmission,
} from "../career-edit/CareerEdit.types";

/**
 * "2020.03.01" 같은 화면 표기를 ISO 날짜로 바꾼다.
 * 비어 있거나 일부만 채워졌으면 null 을 돌려준다 — 백엔드 LocalDate 는 빈 문자열을 읽지 못해 400 이다.
 */
function toIsoDate(value: string): string | null {
  const [year, month, day] = value.match(/\d+/g) ?? [];

  if (!year || !month || !day) {
    return null;
  }

  return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/**
 * 경력 수정 API 의 성별은 enum 이름(MALE/FEMALE)이다. 대상자 조회 API 의 M/F 와 표기가 다르다.
 * 알 수 없으면 null — 백엔드가 @NotNull 로 막으므로 요청 전에 걸러낸다.
 */
function toApiGender(
  gender: CareerEditApplicant["gender"],
): "MALE" | "FEMALE" | null {
  if (gender === "male") {
    return "MALE";
  }

  return gender === "female" ? "FEMALE" : null;
}

/** 허용값 검증이 있는 선택 필드는 빈 문자열이면 400 이라 null 로 보낸다. */
function toNullableCode(value: string): string | null {
  return value.trim() || null;
}

/** admin-web/user-web 이 공유하는 경력사항 수정 페이지. */
function StaffCareerEditPage() {
  const navigate = useNavigate();
  const navigateHome = () => void navigate("/");
  // 경력 수정 PUT은 전체 필드를 요구하므로, 화면에 노출하지 않는
  // division(구분)/employmentType/expirationDate 원본을 목록 조회 결과에서 보존한다.
  const certificatesRef = useRef(new Map<string, HumanCertificate>());
  // 인적사항 수정 PUT도 전체 교체라, 화면에 노출하지 않는 department 원본을
  // 검색 결과에서 보존한다.
  const humanDepartmentsRef = useRef(new Map<string, string>());

  const handleSearch = async (query: {
    name: string;
    birthDate: string;
    page: number;
  }): Promise<{ items: CareerEditApplicant[]; totalPages: number }> => {
    // 화면은 1부터, 서버는 0부터 세므로 요청 시 한 칸 당긴다.
    const result = await searchHumansPaged(
      {
        name: query.name,
        birthDateFrom: query.birthDate,
        birthDateTo: query.birthDate,
      },
      { page: query.page - 1 },
      { token: getAuthToken() },
    );

    humanDepartmentsRef.current = new Map(
      result.items.map((human) => [String(human.humanId), human.department]),
    );

    return {
      items: result.items.map((human) => ({
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
      })),
      totalPages: result.totalPages,
    };
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
      position: certificate.jobTitle,
      duties: certificate.keyResponsibilities,
      department: certificate.department,
      startDate: certificate.hireDate.replaceAll("-", "."),
      endDate: certificate.retirementDate.replaceAll("-", "."),
      retirementReason: certificate.reason,
      note: certificate.note,
    }));
  };

  const handleDeleteApplicant = async (applicantId: string) => {
    const humanId = Number(applicantId);

    if (!Number.isInteger(humanId) || humanId <= 0) {
      throw new Error("대상자 정보가 올바르지 않습니다. 다시 조회해 주세요.");
    }

    await deleteHuman(humanId, { token: getAuthToken() });
    humanDepartmentsRef.current.delete(applicantId);
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
        humanId,
        {
          name: personalInfo.name,
          gender: personalInfo.gender === "male" ? "M" : "F",
          birthDate: `${personalInfo.birthYear}-${personalInfo.birthMonth.padStart(2, "0")}-${personalInfo.birthDay.padStart(2, "0")}`,
          address: personalInfo.address || null,
          department:
            humanDepartmentsRef.current.get(submission.applicant.id) ?? "",
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
    const gender = toApiGender(applicant.gender);

    if (!gender) {
      throw new Error(
        "대상자 성별 정보가 없어 수정할 수 없습니다. 인적사항 수정에서 성별을 먼저 지정해 주세요.",
      );
    }

    await updateCertificate(
      certificateId,
      {
        name: applicant.name,
        birthDate: toIsoDate(applicant.birthDate),
        gender,
        jobTitle: record.position,
        keyResponsibilities: record.duties,
        hireDate: toIsoDate(record.startDate),
        expirationDate: toIsoDate(original.expirationDate),
        retirementDate: toIsoDate(record.endDate),
        // 구분(채용/전보/해지/퇴직)은 화면에서 편집하지 않으므로 원본을 유지한다.
        // 목록 조회가 null 을 빈 문자열로 정규화해 주므로 여기서 다시 null 로 되돌린다.
        division: toNullableCode(original.division),
        department: record.department,
        reason: record.retirementReason,
        employmentType: toNullableCode(original.employmentType),
        note: record.note,
      },
      { token },
    );
  };

  return (
    <CareerEdit
      onCancel={navigateHome}
      onHome={navigateHome}
      onSearchAddress={searchRoadAddresses}
      onSearch={handleSearch}
      onLoadCareerRecords={handleLoadCareerRecords}
      onDeleteApplicant={handleDeleteApplicant}
      onComplete={handleComplete}
    />
  );
}

export default StaffCareerEditPage;
