import "krds-react/dist/index.css";

import {
  ADMIN_USER_INITIAL_PASSWORD,
  INITIAL_PASSWORD_MAX_LENGTH,
  INITIAL_PASSWORD_MIN_LENGTH,
  changeInitialPassword,
  getAuthToken,
  getSafeRedirectPath,
} from "@commonly/utils";
import { TextInput } from "krds-react";
import styled from "@emotion/styled";
import type { FormEvent } from "react";
import { useId, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  FieldStack,
  FormCard,
  FormSectionTitle,
  PageActionButton,
  PageActionRow,
  PageTitle,
  SubmissionError,
  WorkflowRoot,
} from "../user-management/userManagement.styles";

/** 초기 비밀번호 변경 페이지 경로. admin-web/user-web 라우터와 레이아웃이 함께 쓴다. */
export const INITIAL_PASSWORD_CHANGE_PATH = "/password/initial";

const GuidanceText = styled.p`
  margin: 0;
  color: var(--krds-light-color-text-subtle, #464c53);
  font-size: 17px;
  line-height: 1.5;
`;

interface InitialPasswordChangeErrors {
  password?: string;
  passwordConfirm?: string;
}

/**
 * 비밀번호 변경 후 돌아갈 경로. 비밀번호 변경 페이지 자신을 가리키면 홈으로 보낸다.
 */
function resolveRedirectPath(search: string): string {
  const redirectPath = getSafeRedirectPath(
    new URLSearchParams(search).get("redirectTo"),
  );

  try {
    const { pathname } = new URL(redirectPath, "https://commonly.local");

    if (pathname === INITIAL_PASSWORD_CHANGE_PATH) {
      return "/";
    }
  } catch {
    return "/";
  }

  return redirectPath;
}

/**
 * admin-web/user-web 이 공유하는 초기 비밀번호 변경 페이지.
 * 관리자가 만든 직원 계정은 초기 비밀번호를 바꾸기 전까지 다른 기능을 쓸 수 없다.
 */
function InitialPasswordChangePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const titleId = useId();
  const formId = useId();
  const passwordId = useId();
  const passwordConfirmId = useId();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<InitialPasswordChangeErrors>({});
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: InitialPasswordChangeErrors = {};

    if (!password) {
      nextErrors.password = "새 비밀번호를 입력해주세요.";
    } else if (
      password.length < INITIAL_PASSWORD_MIN_LENGTH ||
      password.length > INITIAL_PASSWORD_MAX_LENGTH
    ) {
      nextErrors.password = `비밀번호는 ${INITIAL_PASSWORD_MIN_LENGTH}자 이상 ${INITIAL_PASSWORD_MAX_LENGTH}자 이하로 입력해주세요.`;
    } else if (password === ADMIN_USER_INITIAL_PASSWORD) {
      nextErrors.password = "초기 비밀번호는 새 비밀번호로 사용할 수 없습니다.";
    }

    if (!passwordConfirm) {
      nextErrors.passwordConfirm = "새 비밀번호를 한 번 더 입력해주세요.";
    } else if (passwordConfirm !== password) {
      nextErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }

    setErrors(nextErrors);
    setSubmissionError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await changeInitialPassword({ password }, { token: getAuthToken() });
      void navigate(resolveRedirectPath(location.search), { replace: true });
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "비밀번호 변경 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WorkflowRoot aria-labelledby={titleId}>
      <PageTitle id={titleId}>초기 비밀번호 변경</PageTitle>

      <FormCard
        id={formId}
        noValidate
        onSubmit={(event) => void handleSubmit(event)}
      >
        <FormSectionTitle>새 비밀번호 설정</FormSectionTitle>
        <GuidanceText>
          관리자가 발급한 초기 비밀번호로 로그인한 계정입니다. 서비스를
          이용하려면 먼저 새 비밀번호로 변경해 주세요.
        </GuidanceText>
        <FieldStack>
          <TextInput
            id={passwordId}
            name="password"
            type="password"
            label="새 비밀번호"
            placeholder={`${INITIAL_PASSWORD_MIN_LENGTH}자 이상 ${INITIAL_PASSWORD_MAX_LENGTH}자 이하로 입력해주세요`}
            value={password}
            error={errors.password}
            autoComplete="new-password"
            showPasswordToggle
            onChange={(value) => {
              setPassword(value);
              setErrors((currentErrors) => ({
                ...currentErrors,
                password: undefined,
              }));
            }}
          />
          <TextInput
            id={passwordConfirmId}
            name="passwordConfirm"
            type="password"
            label="새 비밀번호 확인"
            placeholder="새 비밀번호를 한 번 더 입력해주세요"
            value={passwordConfirm}
            error={errors.passwordConfirm}
            autoComplete="new-password"
            showPasswordToggle
            onChange={(value) => {
              setPasswordConfirm(value);
              setErrors((currentErrors) => ({
                ...currentErrors,
                passwordConfirm: undefined,
              }));
            }}
          />
        </FieldStack>

        {submissionError && (
          <SubmissionError role="alert">{submissionError}</SubmissionError>
        )}
      </FormCard>

      <PageActionRow>
        <PageActionButton
          variant="primary"
          size="xlarge"
          type="submit"
          form={formId}
          disabled={isSubmitting}
        >
          {isSubmitting ? "변경 중..." : "비밀번호 변경"}
        </PageActionButton>
      </PageActionRow>
    </WorkflowRoot>
  );
}

export default InitialPasswordChangePage;
