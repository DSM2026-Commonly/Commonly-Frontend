import { describe, expect, it, mock } from "bun:test";
import {
  formatBirthDate,
  requestTestSignupIdentity,
} from "../src/pages/signupVerification";

describe("formatBirthDate", () => {
  it("formats an eight-digit birth date as YYYY.MM.DD", () => {
    expect(formatBirthDate("20090302")).toBe("2009.03.02");
    expect(formatBirthDate("2009-03-02")).toBe("2009.03.02");
  });
});

describe("requestTestSignupIdentity", () => {
  it("collects and trims the test verification values", () => {
    const prompt = mock()
      .mockReturnValueOnce(" 홍길동 ")
      .mockReturnValueOnce(" 19900101 ")
      .mockReturnValueOnce(" 010-1234-5678 ");

    expect(requestTestSignupIdentity(prompt)).toEqual({
      name: "홍길동",
      birthDate: "1990.01.01",
      phoneNumber: "010-1234-5678",
    });
    expect(prompt).toHaveBeenCalledTimes(3);
  });

  it("stops verification when a prompt is cancelled", () => {
    const prompt = mock().mockReturnValueOnce("홍길동").mockReturnValueOnce(null);

    expect(requestTestSignupIdentity(prompt)).toBeNull();
    expect(prompt).toHaveBeenCalledTimes(2);
  });
});
