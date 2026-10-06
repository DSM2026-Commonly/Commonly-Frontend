import { describe, expect, test } from "bun:test";
import type { IndividualRegistrationDuplicateCandidate } from "../src/registration/individual-registration-subject/IndividualRegistrationSubject";
import {
  findDuplicateCandidates,
  getMissingSubjectFields,
} from "../src/registration/individual-registration-subject/IndividualRegistrationSubject.utils";

const candidate: IndividualRegistrationDuplicateCandidate = {
  id: "subject-1",
  name: "홍길동",
  gender: "male",
  birthYear: "1990",
  birthMonth: "01",
  birthDay: "02",
  address: "서울특별시 종로구 세종대로 1",
};

const subject = {
  name: " 홍길동 ",
  gender: "male" as const,
  birthYear: "1990",
  birthMonth: "1",
  birthDay: "2",
  address: "  서울특별시 종로구 세종대로 1  ",
};

describe("findDuplicateCandidates", () => {
  test("matches a duplicate when the subject address has surrounding whitespace", () => {
    expect(findDuplicateCandidates(subject, [candidate])).toEqual([candidate]);
  });

  test("does not match a candidate with a different normalized address", () => {
    expect(
      findDuplicateCandidates(subject, [
        { ...candidate, address: "서울특별시 종로구 세종대로 2" },
      ]),
    ).toEqual([]);
  });
});


describe("getMissingSubjectFields", () => {
  test("lists every required field of an empty form", () => {
    expect(
      getMissingSubjectFields({
        name: "",
        gender: "",
        birthYear: "",
        birthMonth: "",
        birthDay: "",
        address: "",
      }),
    ).toEqual(["이름", "성별", "생년월일", "주소지"]);
  });

  test("lists the birth date until all of its parts are entered", () => {
    expect(getMissingSubjectFields({ ...subject, birthDay: "" })).toEqual([
      "생년월일",
    ]);
  });

  test("leaves out an entered birth date with an invalid format", () => {
    expect(getMissingSubjectFields({ ...subject, birthMonth: "13" })).toEqual(
      [],
    );
  });

  test("treats a whitespace-only name as missing", () => {
    expect(getMissingSubjectFields({ ...subject, name: "  " })).toEqual([
      "이름",
    ]);
  });
});
