import type {
  IndividualRegistrationDuplicateCandidate,
  IndividualRegistrationSubjectData,
} from "./IndividualRegistrationSubject";

/**
 * 중복 후보 페이지 응답이 비었을 때 다시 조회할 페이지(1부터 시작)를 고른다.
 * 2페이지 이상이 비었다면 그 사이 데이터가 줄었을 뿐 앞 페이지엔 후보가 남아 있을 수 있어
 * 마지막 유효 페이지로 돌아간다. 1페이지가 비었거나 결과가 있으면 다시 조회하지 않는다(null).
 */
export const getDuplicateRetryPage = (
  page: number,
  itemCount: number,
  totalPages: number,
): number | null => {
  if (page <= 1 || itemCount > 0) {
    return null;
  }

  return Math.max(1, Math.min(page - 1, totalPages));
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
