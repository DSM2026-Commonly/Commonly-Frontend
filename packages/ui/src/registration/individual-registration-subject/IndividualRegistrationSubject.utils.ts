import { hasAllDateParts } from "../../form/requiredFields.utils";
import type {
  IndividualRegistrationDuplicateCandidate,
  IndividualRegistrationSubjectData,
} from "./IndividualRegistrationSubject";

type SubjectInput = Omit<
  IndividualRegistrationSubjectData,
  "gender" | "duplicateResolution" | "existingSubjectId"
> & {
  gender: IndividualRegistrationSubjectData["gender"] | "";
};

/**
 * 아직 입력하지 않은 필수 항목의 라벨.
 * 입력했지만 형식이 틀린 생년월일은 입력란 아래 오류 문구로 알리므로 넣지 않는다.
 */
export const getMissingSubjectFields = (subject: SubjectInput) => {
  const missingFields: string[] = [];

  if (!subject.name.trim()) {
    missingFields.push("이름");
  }

  if (!subject.gender) {
    missingFields.push("성별");
  }

  if (
    !hasAllDateParts(subject.birthYear, subject.birthMonth, subject.birthDay)
  ) {
    missingFields.push("생년월일");
  }

  if (!subject.address) {
    missingFields.push("주소지");
  }

  return missingFields;
};

export const findDuplicateCandidates = (
  subject: Omit<
    IndividualRegistrationSubjectData,
    "duplicateResolution" | "existingSubjectId"
  >,
  candidates: readonly IndividualRegistrationDuplicateCandidate[],
) =>
  candidates.filter(
    (candidate) =>
      candidate.name === subject.name.trim() &&
      candidate.gender === subject.gender &&
      candidate.birthYear === subject.birthYear &&
      candidate.birthMonth === subject.birthMonth.padStart(2, "0") &&
      candidate.birthDay === subject.birthDay.padStart(2, "0") &&
      candidate.address === subject.address.trim(),
  );
