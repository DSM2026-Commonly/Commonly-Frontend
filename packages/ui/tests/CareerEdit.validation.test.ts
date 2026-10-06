import { describe, expect, test } from "bun:test";
import type {
  CareerEditPersonalInfo,
  CareerEditRecord,
} from "../src/career-edit/CareerEdit.types";
import {
  getMissingCareerRecordFields,
  getMissingPersonalInfoFields,
  isCareerRecordSavable,
  isPartialEditableDate,
  isPersonalInfoSavable,
} from "../src/career-edit/CareerEdit.validation";

const personalInfo: CareerEditPersonalInfo = {
  name: "홍길동",
  gender: "male",
  birthYear: "1990",
  birthMonth: "1",
  birthDay: "2",
  address: "대전광역시 유성구 대학로 211",
};

const record: CareerEditRecord = {
  id: "career-1",
  position: "행정",
  duties: "민원 접수",
  department: "총무과",
  startDate: "2020.3.1",
  endDate: "",
  retirementReason: "",
  note: "",
};

describe("getMissingPersonalInfoFields", () => {
  test("lists every required field of an empty form", () => {
    expect(
      getMissingPersonalInfoFields({
        name: "",
        gender: "",
        birthYear: "",
        birthMonth: "",
        birthDay: "",
        address: " ",
      }),
    ).toEqual(["이름", "성별", "생년월일", "주소지"]);
  });

  test("leaves out an entered birth date with an invalid format", () => {
    const invalidBirthDate = { ...personalInfo, birthDay: "32" };

    expect(getMissingPersonalInfoFields(invalidBirthDate)).toEqual([]);
    expect(isPersonalInfoSavable(invalidBirthDate)).toBe(false);
  });

  test("saves complete personal info", () => {
    expect(isPersonalInfoSavable(personalInfo)).toBe(true);
  });
});

describe("getMissingCareerRecordFields", () => {
  test("lists the emptied required fields", () => {
    expect(
      getMissingCareerRecordFields({
        ...record,
        position: "",
        duties: " ",
        department: "",
        startDate: "2020..",
      }),
    ).toEqual(["직종명", "담당업무", "근무부서", "근무 시작일"]);
  });

  test("does not require the end date or the retirement reason", () => {
    expect(getMissingCareerRecordFields(record)).toEqual([]);
    expect(isCareerRecordSavable(record)).toBe(true);
  });

  test("blocks saving while a required field is missing", () => {
    expect(isCareerRecordSavable({ ...record, department: "" })).toBe(false);
  });

  test("blocks saving a partially entered end date", () => {
    const partialEndDate = { ...record, endDate: "2021.." };

    expect(isPartialEditableDate(partialEndDate.endDate)).toBe(true);
    expect(getMissingCareerRecordFields(partialEndDate)).toEqual([]);
    expect(isCareerRecordSavable(partialEndDate)).toBe(false);
  });

  test("treats an empty or complete end date as not partial", () => {
    expect(isPartialEditableDate("")).toBe(false);
    expect(isPartialEditableDate("..")).toBe(false);
    expect(isPartialEditableDate("2021.2.28")).toBe(false);
    expect(isPartialEditableDate("2021-02-28")).toBe(false);
  });
});
