import type {
  IndividualRegistrationDuplicateCandidate,
  IndividualRegistrationSubjectData,
} from "./IndividualRegistrationSubject";

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
