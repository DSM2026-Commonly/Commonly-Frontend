import { describe, expect, test } from "bun:test";
import type { HumanCertificate } from "@commonly/utils";
import { toCareerRow } from "../src/pages/StaffCareerCertificateIssuePage";

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
