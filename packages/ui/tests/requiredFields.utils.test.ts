import { describe, expect, test } from "bun:test";
import {
  getRequiredFieldsMessage,
  hasAllDateParts,
} from "../src/form/requiredFields.utils";

describe("getRequiredFieldsMessage", () => {
  test("lists the missing required fields in order", () => {
    expect(getRequiredFieldsMessage(["직종명", "퇴직 사유"])).toBe(
      "필수 항목을 입력해 주세요: 직종명, 퇴직 사유",
    );
  });

  test("returns an empty message when nothing is missing", () => {
    expect(getRequiredFieldsMessage([])).toBe("");
  });
});

describe("hasAllDateParts", () => {
  test("requires year, month and day", () => {
    expect(hasAllDateParts("2024", "1", "2")).toBe(true);
    expect(hasAllDateParts("2024", "", "2")).toBe(false);
    expect(hasAllDateParts("", "", "")).toBe(false);
  });

  test("does not judge the format of entered parts", () => {
    expect(hasAllDateParts("2024", "13", "2")).toBe(true);
  });
});
