import "krds-react/dist/index.css";

import type { FormEvent } from "react";
import { useId, useState } from "react";
import { TextInput } from "krds-react";
import ApplicationShell from "../layout/ApplicationShell";
import {
  AccountHelpLink,
  AccountHelpLinks,
  AccountHelpSeparator,
  FieldGroup,
  FormError,
  HelpCard,
  HelpIcon,
  HelpList,
  HelpTitle,
  LoginContent,
  LoginEyebrow,
  LoginField,
  LoginFieldLabel,
  LoginForm,
  LoginHeading,
  LoginHeadingArea,
  LoginPanel,
  LoginSubmitButton,
  SectionDivider,
} from "./login.styles";

export interface LoginFormData {
  loginId: string;
  password: string;
  rememberLoginId: boolean;
}

export type LoginVariant = "default" | "civil";

export interface LoginProps {
  initialLoginId?: string;
  onSubmit: (data: LoginFormData) => void | Promise<void>;
  signupHref?: string;
  variant?: LoginVariant;
}

interface LoginFieldErrors {
  loginId?: string;
  password?: string;
}

function Login({
  initialLoginId = "",
  onSubmit,
  signupHref = "#login-help",
  variant = "default",
}: LoginProps) {
  const titleId = useId();
  const loginIdInputId = useId();
  const passwordInputId = useId();
  const [loginId, setLoginId] = useState(initialLoginId);
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCivil = variant === "civil";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedLoginId = loginId.trim();
    const nextFieldErrors: LoginFieldErrors = {};

    if (!normalizedLoginId) {
      nextFieldErrors.loginId = "아이디를 입력해 주세요.";
    }

    if (!password) {
      nextFieldErrors.password = "비밀번호를 입력해 주세요.";
    }

    setFieldErrors(nextFieldErrors);
    setSubmissionError("");

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        loginId: normalizedLoginId,
        password,
        rememberLoginId: false,
      });
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginIdInput = (
    <TextInput
      id={loginIdInputId}
      name="loginId"
      size={isCivil ? "large" : "medium"}
      value={loginId}
      placeholder={isCivil ? "아이디를 입력하세요" : "아이디"}
      aria-label="아이디"
      autoComplete="username"
      error={fieldErrors.loginId}
      onChange={(value) => {
        setLoginId(value);
        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          loginId: undefined,
        }));
      }}
    />
  );

  const passwordInput = (
    <TextInput
      id={passwordInputId}
      name="password"
      type="password"
      size={isCivil ? "large" : "medium"}
      value={password}
      placeholder={isCivil ? "비밀번호를 입력하세요" : "비밀번호"}
      aria-label="비밀번호"
      autoComplete="current-password"
      showPasswordToggle={!isCivil}
      error={fieldErrors.password}
      onChange={(value) => {
        setPassword(value);
        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          password: undefined,
        }));
      }}
    />
  );

  const form = (
    <LoginForm
      $variant={variant}
      noValidate
      onSubmit={(event) => void handleSubmit(event)}
    >
      <FieldGroup $variant={variant}>
        {isCivil ? (
          <>
            <LoginField>
              <LoginFieldLabel htmlFor={loginIdInputId}>
                아이디
              </LoginFieldLabel>
              {loginIdInput}
            </LoginField>
            <LoginField>
              <LoginFieldLabel htmlFor={passwordInputId}>
                비밀번호
              </LoginFieldLabel>
              {passwordInput}
            </LoginField>
          </>
        ) : (
          <>
            {loginIdInput}
            {passwordInput}
          </>
        )}
      </FieldGroup>

      {submissionError && <FormError role="alert">{submissionError}</FormError>}

      <LoginSubmitButton
        $variant={variant}
        variant="primary"
        size="large"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "로그인 중..." : "로그인"}
      </LoginSubmitButton>

      <AccountHelpLinks $variant={variant} aria-label="계정 도움말 바로가기">
        <AccountHelpLink href="#login-help">아이디 찾기</AccountHelpLink>
        <AccountHelpSeparator aria-hidden="true" />
        <AccountHelpLink href="#login-help">비밀번호 찾기</AccountHelpLink>
        {isCivil && (
          <>
            <AccountHelpSeparator aria-hidden="true" />
            <AccountHelpLink href={signupHref}>회원가입</AccountHelpLink>
          </>
        )}
      </AccountHelpLinks>
    </LoginForm>
  );

  return (
    <ApplicationShell headerVariant="not-auth" fillViewport={!isCivil}>
      <LoginContent $variant={variant} aria-labelledby={titleId}>
        <LoginHeadingArea $variant={variant}>
          <LoginEyebrow $variant={variant}>
            {isCivil
              ? "유성구 경력관리 시스템 사용자"
              : "유성구 경력관리 시스템"}
          </LoginEyebrow>
          <LoginHeading $variant={variant} id={titleId}>
            로그인
          </LoginHeading>
        </LoginHeadingArea>

        {isCivil ? <LoginPanel>{form}</LoginPanel> : form}

        {!isCivil && <SectionDivider role="separator" />}

        <HelpCard
          $variant={variant}
          id="login-help"
          aria-labelledby="login-help-title"
        >
          <HelpTitle id="login-help-title">
            <HelpIcon aria-hidden="true">i</HelpIcon>
            로그인에 어려움이 있으신가요?
          </HelpTitle>
          <HelpList $variant={variant} type={isCivil ? undefined : "dash"}>
            {isCivil ? (
              <>
                <li>
                  아이디가 기억나지 않는다면 '아이디 찾기'를 이용해 주세요.
                </li>
                <li>
                  비밀번호를 잊으셨다면 '비밀번호 재설정'을 이용해 주세요.
                </li>
                <li>
                  042-611-2114으로 전화주세요. 서비스에 로그인할 수 있도록
                  도와드리겠습니다.
                </li>
              </>
            ) : (
              <>
                <li>
                  아이디 또는 비밀번호를 잊으신 경우 시스템 관리자에게 문의해
                  주세요.
                </li>
                <li>
                  접속 오류가 계속되면 대표전화 042-611-2114로 문의해 주세요.
                </li>
              </>
            )}
          </HelpList>
        </HelpCard>
      </LoginContent>
    </ApplicationShell>
  );
}

export default Login;
