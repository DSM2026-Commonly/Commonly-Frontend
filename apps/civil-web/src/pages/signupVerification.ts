export interface VerifiedSignupIdentity {
  name: string;
  birthDate: string;
  phoneNumber: string;
}

type Prompt = (message: string) => string | null;

const verificationPrompts: ReadonlyArray<
  readonly [keyof VerifiedSignupIdentity, string]
> = [
  ["name", "[테스트 본인인증] 이름을 입력해주세요."],
  ["birthDate", "[테스트 본인인증] 생년월일을 입력해주세요."],
  ["phoneNumber", "[테스트 본인인증] 전화번호를 입력해주세요."],
];

export function formatBirthDate(value: string): string {
  const trimmedValue = value.trim();
  const digits = trimmedValue.replace(/\D/g, "");

  if (digits.length !== 8) {
    return trimmedValue;
  }

  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`;
}

export function requestTestSignupIdentity(
  prompt: Prompt = window.prompt.bind(window),
): VerifiedSignupIdentity | null {
  const identity = {} as VerifiedSignupIdentity;

  for (const [field, message] of verificationPrompts) {
    const value = prompt(message);

    if (value === null) {
      return null;
    }

    identity[field] =
      field === "birthDate" ? formatBirthDate(value) : value.trim();
  }

  return identity;
}
