import { describe, expect, test } from "bun:test";
import type { IndividualRegistrationDuplicateCandidate } from "../src/registration/individual-registration-subject/IndividualRegistrationSubject";
import { findDuplicateCandidates } from "../src/registration/individual-registration-subject/IndividualRegistrationSubject.utils";

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
