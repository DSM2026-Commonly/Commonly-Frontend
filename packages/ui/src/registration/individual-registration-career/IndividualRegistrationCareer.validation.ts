const toComparableDate = (year: string, month: string, day: string) =>
  `${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`;

export const isValidCareerDateRange = (
  startYear: string,
  startMonth: string,
  startDay: string,
  endYear: string,
  endMonth: string,
  endDay: string,
) =>
  toComparableDate(startYear, startMonth, startDay) <=
  toComparableDate(endYear, endMonth, endDay);
