/** 연·월·일을 나눠 받는 날짜 입력에서 세 칸이 모두 채워졌는지. 형식 검사는 따로 한다. */
export const hasAllDateParts = (year: string, month: string, day: string) =>
  Boolean(year && month && day);

/** 진행 버튼 근처에 보여줄 누락 필수 항목 안내. 누락이 없으면 빈 문자열이다. */
export const getRequiredFieldsMessage = (fields: readonly string[]) =>
  fields.length > 0 ? `필수 항목을 입력해 주세요: ${fields.join(", ")}` : "";
