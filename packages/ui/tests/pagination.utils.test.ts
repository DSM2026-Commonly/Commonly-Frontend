import { describe, expect, test } from "bun:test";
import { getEmptyPageRetryPage } from "../src/pagination/pagination.utils";

describe("getEmptyPageRetryPage", () => {
  test("does not retry when the page has results", () => {
    expect(getEmptyPageRetryPage(3, 5, 3)).toBeNull();
  });

  test("does not retry an empty first page, which really means no results", () => {
    expect(getEmptyPageRetryPage(1, 0, 0)).toBeNull();
  });

  test("falls back to the new last page when later pages emptied out", () => {
    expect(getEmptyPageRetryPage(3, 0, 1)).toBe(1);
    expect(getEmptyPageRetryPage(3, 0, 2)).toBe(2);
  });

  test("steps back one page when the server still reports more pages", () => {
    expect(getEmptyPageRetryPage(4, 0, 9)).toBe(3);
  });

  test("never goes below page 1 even when totalPages is 0", () => {
    expect(getEmptyPageRetryPage(2, 0, 0)).toBe(1);
  });
});
