import { describe, expect, test } from "bun:test";
import type { IndividualRegistrationDuplicateCandidate } from "../src/registration/individual-registration-subject/IndividualRegistrationSubject";
import {
  findDuplicateCandidates,
  getDuplicateRetryPage,
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

describe("getDuplicateRetryPage", () => {
  test("does not retry when the page has candidates", () => {
    expect(getDuplicateRetryPage(3, 5, 3)).toBeNull();
  });

  test("does not retry an empty first page, which really means no duplicates", () => {
    expect(getDuplicateRetryPage(1, 0, 0)).toBeNull();
  });

  test("falls back to the new last page when later pages emptied out", () => {
    expect(getDuplicateRetryPage(3, 0, 1)).toBe(1);
    expect(getDuplicateRetryPage(3, 0, 2)).toBe(2);
  });

  test("steps back one page when the server still reports more pages", () => {
    expect(getDuplicateRetryPage(4, 0, 9)).toBe(3);
  });

  test("never goes below page 1 even when totalPages is 0", () => {
    expect(getDuplicateRetryPage(2, 0, 0)).toBe(1);
  });
});
