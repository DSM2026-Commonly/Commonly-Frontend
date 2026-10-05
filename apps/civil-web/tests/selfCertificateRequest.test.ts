import { describe, expect, it } from "bun:test";
import type { CareerCertificateApplicationData } from "@commonly/ui";
import { toSelfCertificateRequest } from "../src/pages/selfCertificateRequest";

const applicationData: CareerCertificateApplicationData = {
  issueType: "all",
  reason: "visit",
  note: "",
  applicantId: "",
  applicantName: "",
  birthYear: "",
  birthMonth: "",
  birthDay: "",
  selectedCareerIds: ["10", "12"],
  additionalNote: "",
  purpose: "은행 제출용",
};

describe("toSelfCertificateRequest", () => {
  it("omits certificateIds for 전체 발급 so the server issues every career", () => {
    const request = toSelfCertificateRequest(applicationData);

    expect(request).toEqual({ purpose: "은행 제출용", otherMatters: "" });
    expect(request).not.toHaveProperty("certificateIds");
  });

  it("sends the chosen careers for 선택 발급", () => {
    expect(
      toSelfCertificateRequest({ ...applicationData, issueType: "selected" }),
    ).toEqual({
      purpose: "은행 제출용",
      otherMatters: "",
      certificateIds: [10, 12],
    });
  });

  it("omits certificateIds when nothing could be chosen (목록 조회 실패)", () => {
    const request = toSelfCertificateRequest({
      ...applicationData,
      issueType: "selected",
      selectedCareerIds: [],
    });

    expect(request).not.toHaveProperty("certificateIds");
  });

  it("rejects a malformed career id instead of sending it", () => {
    expect(() =>
      toSelfCertificateRequest({
        ...applicationData,
        issueType: "selected",
        selectedCareerIds: ["10", "abc"],
      }),
    ).toThrow("발급할 경력 정보가 올바르지 않습니다");
  });
});
