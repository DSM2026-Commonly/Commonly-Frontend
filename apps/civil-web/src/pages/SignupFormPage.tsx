import { ApplicationShell } from "@commonly/ui";
import { createLocalSessionToken, setAuthToken } from "@commonly/utils";
import styled from "@emotion/styled";
import { Button, TextInput } from "krds-react";
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import type { VerifiedSignupIdentity } from "./signupVerification";

const SignupContent = styled.section`
  width: min(792px, calc(100% - 40px));
  margin: 88px auto 0;
  padding-bottom: 64px;
  box-sizing: border-box;
  color: var(--krds-light-color-text-basic, #1e2124);
  font-family:
    "Pretendard GOV", Pretendard, "Noto Sans KR", "Malgun Gothic", sans-serif;

  @media (max-width: 767px) {
    margin-top: 40px;
    padding-bottom: 48px;
  }
`;

const HeadingArea = styled.header`
  display: flex;
  min-height: 99px;
  flex-direction: column;
  gap: 16px;
`;

const Eyebrow = styled.p`
  margin: 0;
  color: var(--krds-light-color-text-subtle, #464c53);
  font-size: 15px;
  font-weight: 700;
  line-height: 23px;
`;

const Heading = styled.h1`
  margin: 0;
  color: var(--krds-light-color-text-bolder, #131416);
  font-size: 40px;
  font-weight: 700;
  line-height: 60px;
  letter-spacing: 1px;

  @media (max-width: 767px) {
    font-size: 32px;
    line-height: 48px;
  }
`;

const SignupBody = styled.div`
  margin-top: 48px;

  @media (max-width: 767px) {
    margin-top: 32px;
  }
`;

const SignupPanel = styled.div`
  width: 100%;
  padding: 31px 32px;
  box-sizing: border-box;
  border-top: 1px solid
    var(--krds-light-color-divider-gray, #8a949e);
  border-bottom: 1px solid
    var(--krds-light-color-divider-gray, #8a949e);

  @media (max-width: 767px) {
    padding: 24px 0;
  }
`;

const SignupForm = styled.form`
  display: flex;
  width: min(100%, 480px);
  margin: 0 auto;
  flex-direction: column;

  .form-group,
  .form-conts {
    width: 100%;
  }

  .krds-input {
    width: 100%;
    height: 56px;
    min-height: 56px;
    padding: 0 16px;
    box-sizing: border-box;
    border: 1px solid
      var(--krds-light-color-border-gray-dark, #58616a);
    border-radius: 8px;
    color: var(--krds-light-color-text-basic, #1e2124);
    background: var(--krds-light-color-surface-white, #ffffff);
    font-size: 19px;
    line-height: 29px;
  }

  .krds-input::placeholder {
    color: var(--krds-light-color-text-disabled, #8a949e);
    opacity: 1;
  }

  .krds-input:read-only {
    color: var(--krds-light-color-text-subtle, #464c53);
    background: var(--krds-light-color-surface-gray-subtler, #f4f5f6);
    cursor: default;
  }

  .krds-input:focus {
    border-color: var(--krds-light-color-border-primary, #256ef4);
    outline: 2px solid var(--krds-light-color-border-primary, #256ef4);
    outline-offset: 2px;
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SignupField = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 8px;
`;

const FieldLabel = styled.label`
  color: var(--krds-light-color-text-subtle, #464c53);
  font-size: 15px;
  font-weight: 400;
  line-height: 23px;
`;

const SignupButton = styled(Button)`
  &.krds-btn {
    width: 100%;
    min-width: 0;
    height: 56px;
    min-height: 56px;
    margin-top: 24px;
    padding: 0 20px;
    border-radius: 8px;
    font-size: 17px;
    font-weight: 700;
    line-height: 1.5;
  }
`;

const FormError = styled.p`
  margin: 16px 0 0;
  color: var(--krds-light-color-text-danger, #d50136);
  font-size: 15px;
  line-height: 23px;
`;

const AccountLinks = styled.nav`
  display: flex;
  min-height: 32px;
  margin-top: 24px;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const AccountLink = styled(Link)`
  padding: 3px 2px;
  border-radius: 4px;
  color: var(--krds-light-color-text-subtle, #464c53);
  font-size: 15px;
  line-height: 26px;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    color: var(--krds-light-color-text-primary, #0b50d0);
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid var(--krds-light-color-border-primary, #256ef4);
    outline-offset: 2px;
  }
`;

const AccountLinkSeparator = styled.span`
  width: 1px;
  height: 16px;
  flex: 0 0 1px;
  background: var(--krds-light-color-divider-gray-light, #cdd1d5);
`;

const HelpCard = styled.aside`
  width: 100%;
  min-height: 96px;
  margin-top: 40px;
  padding: 16px 24px;
  box-sizing: border-box;
  border: 1px solid #d6e0eb;
  border-radius: 12px;
  background: #eef2f7;

  @media (max-width: 767px) {
    height: auto;
    padding: 16px 20px;
  }
`;

const HelpTitle = styled.h2`
  display: flex;
  margin: 0;
  align-items: center;
  gap: 8px;
  color: #052b57;
  font-size: 16px;
  font-weight: 700;
  line-height: 26px;
`;

const HelpIcon = styled.span`
  display: inline-flex;
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #ffffff;
  background: #052b57;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
`;

const HelpText = styled.p`
  position: relative;
  margin: 12px 0 0;
  padding-left: 32px;
  color: var(--krds-light-color-text-subtle, #464c53);
  font-size: 15px;
  line-height: 26px;

  &::before {
    position: absolute;
    top: 10px;
    left: 8px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    content: "";
  }
`;

type FieldName =
  | "name"
  | "birthDate"
  | "phoneNumber"
  | "loginId"
  | "password"
  | "passwordConfirmation";

interface SignupFieldDefinition {
  name: FieldName;
  label: string;
  placeholder: string;
  autoComplete: string;
  inputMode?: "numeric" | "tel";
  type?: "text" | "password";
}

const fields: readonly SignupFieldDefinition[] = [
  {
    name: "name",
    label: "이름",
    placeholder: "이름을 입력해주세요",
    autoComplete: "name",
  },
  {
    name: "birthDate",
    label: "생년월일",
    placeholder: "생년월일을 입력하세요",
    autoComplete: "bday",
    inputMode: "numeric",
  },
  {
    name: "phoneNumber",
    label: "전화번호",
    placeholder: "전화번호를 입력하세요",
    autoComplete: "tel",
    inputMode: "tel",
  },
  {
    name: "loginId",
    label: "아이디",
    placeholder: "아이디를 입력하세요",
    autoComplete: "username",
  },
  {
    name: "password",
    label: "비밀번호",
    placeholder: "비밀번호를 입력하세요",
    autoComplete: "new-password",
    type: "password",
  },
  {
    name: "passwordConfirmation",
    label: "비밀번호 확인",
    placeholder: "비밀번호를 다시 입력하세요",
    autoComplete: "new-password",
    type: "password",
  },
] as const;

type FormValues = Record<FieldName, string>;

const initialFormValues = Object.fromEntries(
  fields.map(({ name }) => [name, ""]),
) as FormValues;

interface SignupFormLocationState {
  verifiedIdentity?: VerifiedSignupIdentity;
}

function SignupFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const verifiedIdentity = (location.state as SignupFormLocationState | null)
    ?.verifiedIdentity;
  const [formValues, setFormValues] = useState<FormValues>(() => ({
    ...initialFormValues,
    ...verifiedIdentity,
  }));
  const [submissionError, setSubmissionError] = useState("");
  const isFormIncomplete = Object.values(formValues).some(
    (value) => value.trim() === "",
  );
  const isPasswordMismatch =
    formValues.passwordConfirmation.length > 0 &&
    formValues.password !== formValues.passwordConfirmation;
  const canSubmit = !isFormIncomplete && !isPasswordMismatch;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    if (!setAuthToken(createLocalSessionToken())) {
      setSubmissionError(
        "브라우저 저장소를 사용할 수 없어 회원가입을 완료할 수 없습니다.",
      );
      return;
    }

    setSubmissionError("");
    void navigate("/career/issue", { replace: true });
  };

  return (
    <ApplicationShell headerVariant="not-auth" fillViewport={false}>
      <SignupContent aria-labelledby="signup-form-title">
        <HeadingArea>
          <Eyebrow>유성구 경력관리 시스템 사용자</Eyebrow>
          <Heading id="signup-form-title">회원가입</Heading>
        </HeadingArea>

        <SignupBody>
          <SignupPanel>
            <SignupForm noValidate onSubmit={handleSubmit}>
              <FieldGroup>
                {fields.map((field) => {
                  const inputId = `signup-${field.name}`;

                  return (
                    <SignupField key={field.name}>
                      <FieldLabel htmlFor={inputId}>{field.label}</FieldLabel>
                      <TextInput
                        id={inputId}
                        name={field.name}
                        type={field.type ?? "text"}
                        size="large"
                        value={formValues[field.name]}
                        placeholder={field.placeholder}
                        autoComplete={field.autoComplete}
                        inputMode={field.inputMode}
                        readOnly={
                          verifiedIdentity !== undefined &&
                          field.name in verifiedIdentity
                        }
                        aria-invalid={
                          field.name === "passwordConfirmation" &&
                          isPasswordMismatch
                        }
                        error={
                          field.name === "passwordConfirmation" &&
                          isPasswordMismatch
                            ? "비밀번호가 일치하지 않습니다."
                            : undefined
                        }
                        showPasswordToggle={false}
                        onChange={(value) => {
                          setSubmissionError("");
                          setFormValues((currentValues) => ({
                            ...currentValues,
                            [field.name]: value,
                          }));
                        }}
                      />
                    </SignupField>
                  );
                })}
              </FieldGroup>

              <SignupButton
                variant="primary"
                size="large"
                type="submit"
                disabled={!canSubmit}
              >
                회원가입
              </SignupButton>

              {submissionError && (
                <FormError role="alert">{submissionError}</FormError>
              )}

              <AccountLinks aria-label="계정 도움말 바로가기">
                <AccountLink to="/login">아이디 찾기</AccountLink>
                <AccountLinkSeparator aria-hidden="true" />
                <AccountLink to="/login">비밀번호 찾기</AccountLink>
                <AccountLinkSeparator aria-hidden="true" />
                <AccountLink to="/login">로그인</AccountLink>
              </AccountLinks>
            </SignupForm>
          </SignupPanel>

          <HelpCard aria-labelledby="signup-form-help-title">
            <HelpTitle id="signup-form-help-title">
              <HelpIcon aria-hidden="true">i</HelpIcon>
              회원가입에 어려움이 있으신가요?
            </HelpTitle>
            <HelpText>
              042-611-2114으로 전화주세요. 서비스에 가입할 수 있도록
              도와드리겠습니다.
            </HelpText>
          </HelpCard>
        </SignupBody>
      </SignupContent>
    </ApplicationShell>
  );
}

export default SignupFormPage;
