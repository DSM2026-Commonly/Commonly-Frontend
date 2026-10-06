import { describe, expect, test } from "bun:test";
import type { HumanCertificate } from "@commonly/utils";
import type { CareerCertificateApplicationData } from "../src/career-certificate/CareerCertificateIssue.types";
import { toIssueCertificateRequest } from "../src/pages/issueCertificateRequest";
import { toCareerRow } from "../src/pages/careerRow";

const certificate: HumanCertificate = {
  certificateId: 1,
  // 구분(채용/전보/해지/퇴직). 근무부서 칸에 들어가면 안 된다.
  division: "채용",
  department: "총무과",
  employmentType: "기간제",
  jobTitle: "주무관",
  keyResponsibilities: "민원 응대",
  hireDate: "2020-03-01",
  retirementDate: "2023-02-28",
  expirationDate: "",
  reason: "계약 기간 만료",
  note: "",
};

describe("toCareerRow", () => {
  test("puts department — not division — in the 근무부서 column", () => {
    expect(toCareerRow(certificate)).toEqual({
      id: "1",
      job: "민원 응대",
      department: "총무과",
      period: "2020-03-01 ~ 2023-02-28",
    });
  });

  test("leaves the column empty when the backend has no department", () => {
    // 구분이 남아 있어도 그 값이 근무부서 칸으로 새지 않아야 한다.
    expect(toCareerRow({ ...certificate, department: "" }).department).toBe("");
  });

  test("falls back to the expiration date when there is no retirement date", () => {
    const row = toCareerRow({
      ...certificate,
      retirementDate: "",
      expirationDate: "2025-12-31",
    });

    expect(row.period).toBe("2020-03-01 ~ 2025-12-31");
  });
});

describe("toIssueCertificateRequest", () => {
  const applicationData: CareerCertificateApplicationData = {
    issueType: "selected",
    reason: "visit",
    note: "",
    applicantId: "3",
    applicantName: "홍길동",
    birthYear: "1990",
    birthMonth: "1",
    birthDay: "1",
    selectedCareerIds: ["10", "12"],
    additionalNote: "기타사항 없음",
    purpose: "은행 제출용",
  };

  // 발급과 미리보기가 같은 본문을 보내므로 이 한 함수로 만든다.
  test("builds the shared issue/preview body", () => {
    expect(toIssueCertificateRequest(applicationData)).toEqual({
      humanId: 3,
      certificateIds: [10, 12],
      purpose: "은행 제출용",
      otherMatters: "기타사항 없음",
    });
  });

  test("rejects an invalid applicant or career id", () => {
    for (const data of [
      { ...applicationData, applicantId: "" },
      { ...applicationData, applicantId: "abc" },
      { ...applicationData, selectedCareerIds: [] },
      { ...applicationData, selectedCareerIds: ["10", "x"] },
    ]) {
      expect(() => toIssueCertificateRequest(data)).toThrow(
        "발급 대상 정보가 올바르지 않습니다",
      );
    }
  });
});
