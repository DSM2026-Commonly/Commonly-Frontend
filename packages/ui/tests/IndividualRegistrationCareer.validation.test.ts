import { describe, expect, test } from "bun:test";
import { isValidCareerDateRange } from "../src/registration/individual-registration-career/IndividualRegistrationCareer.validation";

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
