import { describe, expect, test } from "bun:test";
import type { IndividualRegistrationCareerData } from "../src/registration/individual-registration-career/IndividualRegistrationCareer";
import {
  canSubmitCareer,
  getMissingCareerFields,
  isCareerDateRangeReversed,
  isValidCareerDateRange,
} from "../src/registration/individual-registration-career/IndividualRegistrationCareer.validation";

describe("isValidCareerDateRange", () => {
  test("accepts a start date before the end date", () => {
    expect(isValidCareerDateRange("2024", "1", "2", "2024", "10", "1")).toBe(
      true,
    );
  });

  test("accepts the same start and end date", () => {
    expect(isValidCareerDateRange("2024", "01", "02", "2024", "1", "2")).toBe(
      true,
    );
  });

  test("rejects an end date before the start date", () => {
    expect(isValidCareerDateRange("2024", "10", "1", "2024", "1", "2")).toBe(
      false,
    );
  });
});

const completeCareer: IndividualRegistrationCareerData = {
  jobTitle: "행정",
  duties: "민원 접수",
  department: "총무과",
  startYear: "2020",
  startMonth: "3",
  startDay: "1",
  endYear: "2021",
  endMonth: "2",
  endDay: "28",
  resignationReason: "계약 만료",
  note: "",
};

describe("getMissingCareerFields", () => {
  test("lists every required field of an empty form", () => {
    expect(
      getMissingCareerFields({
        ...completeCareer,
        jobTitle: "",
        duties: "",
        department: "",
        startYear: "",
        startMonth: "",
        startDay: "",
        endYear: "",
        endMonth: "",
        endDay: "",
        resignationReason: "",
      }),
    ).toEqual([
      "직종명",
      "담당업무",
      "근무부서",
      "근무 시작일",
      "근무 종료일",
      "퇴직 사유",
    ]);
  });

  test("treats whitespace-only text as missing", () => {
    expect(
      getMissingCareerFields({ ...completeCareer, resignationReason: "   " }),
    ).toEqual(["퇴직 사유"]);
  });

  test("lists a date until all of its parts are entered", () => {
    expect(
      getMissingCareerFields({ ...completeCareer, endDay: "" }),
    ).toEqual(["근무 종료일"]);
  });

  test("leaves out an entered date with an invalid format", () => {
    expect(
      getMissingCareerFields({ ...completeCareer, startMonth: "13" }),
    ).toEqual([]);
  });

  test("does not require the note", () => {
    expect(getMissingCareerFields(completeCareer)).toEqual([]);
  });
});

describe("canSubmitCareer", () => {
  test("allows a complete career", () => {
    expect(canSubmitCareer(completeCareer)).toBe(true);
  });

  test("blocks while a required field is missing", () => {
    expect(canSubmitCareer({ ...completeCareer, resignationReason: "" })).toBe(
      false,
    );
  });

  test("blocks an entered date with an invalid format", () => {
    expect(canSubmitCareer({ ...completeCareer, startMonth: "13" })).toBe(
      false,
    );
  });

  test("blocks an end date before the start date", () => {
    const reversedCareer = { ...completeCareer, endYear: "2019" };

    expect(canSubmitCareer(reversedCareer)).toBe(false);
    expect(isCareerDateRangeReversed(reversedCareer)).toBe(true);
  });

  test("does not report a reversed range until both dates are valid", () => {
    expect(
      isCareerDateRangeReversed({
        ...completeCareer,
        endYear: "2019",
        endDay: "",
      }),
    ).toBe(false);
  });
});
