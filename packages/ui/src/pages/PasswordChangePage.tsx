import "krds-react/dist/index.css";

import {
  ApiError,
  INITIAL_PASSWORD_MAX_LENGTH,
  INITIAL_PASSWORD_MIN_LENGTH,
  changePassword,
  getAuthToken,
} from "@commonly/utils";
import { Button, TextInput } from "krds-react";
import styled from "@emotion/styled";
import type { FormEvent } from "react";
import { useId, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useMeState } from "../hooks/useMe";
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

/** 비밀번호 변경 페이지 경로. 세 앱 라우터와 헤더가 함께 쓴다. */
export const PASSWORD_CHANGE_PATH = "/password/change";

const GuidanceText = styled.p`
  margin: 0;
  color: var(--krds-light-color-text-subtle, #464c53);
  font-size: 17px;
  line-height: 1.5;
`;

const MeErrorRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
`;

interface PasswordChangeErrors {
  currentPassword?: string;
  newPassword?: string;
  newPasswordConfirm?: string;
}

/**
 * 세 앱이 공유하는 비밀번호 변경 페이지. 로그인한 본인의 비밀번호를 현재 비밀번호 확인 후 바꾼다.
 * 변경 API 경로에 본인 userId 가 필요해 내 정보 조회가 끝나야 제출할 수 있다.
 */
function PasswordChangePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { me, isLoading: isMeLoading, retry: retryLoadMe } = useMeState();
  const titleId = useId();
  const formId = useId();
  const currentPasswordId = useId();
  const newPasswordId = useId();
  const newPasswordConfirmId = useId();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<PasswordChangeErrors>({});
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 바꾼 뒤엔 같은 값으로 다시 제출하지 않도록 잠그고 화면 안에서 결과를 알린다.
  const [isChanged, setIsChanged] = useState(false);

  // 앱 안에서 넘어왔으면 그 화면으로, 주소로 바로 열었으면 홈으로 돌아간다.
  const goBack = () => {
    if (location.key !== "default") {
      void navigate(-1);
      return;
    }

    void navigate("/", { replace: true });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!me || isChanged) {
      return;
    }

    const nextErrors: PasswordChangeErrors = {};

    if (!currentPassword) {
      nextErrors.currentPassword = "현재 비밀번호를 입력해주세요.";
    }

    if (!newPassword) {
      nextErrors.newPassword = "새 비밀번호를 입력해주세요.";
    } else if (
      newPassword.length < INITIAL_PASSWORD_MIN_LENGTH ||
      newPassword.length > INITIAL_PASSWORD_MAX_LENGTH
    ) {
      nextErrors.newPassword = `비밀번호는 ${INITIAL_PASSWORD_MIN_LENGTH}자 이상 ${INITIAL_PASSWORD_MAX_LENGTH}자 이하로 입력해주세요.`;
    }

    if (!newPasswordConfirm) {
      nextErrors.newPasswordConfirm = "새 비밀번호를 한 번 더 입력해주세요.";
    } else if (newPasswordConfirm !== newPassword) {
      nextErrors.newPasswordConfirm = "비밀번호가 일치하지 않습니다.";
    }

    setErrors(nextErrors);
    setSubmissionError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword(
        me.userId,
        { password: currentPassword, newPassword },
        { token: getAuthToken() },
      );
      // 입력한 비밀번호를 화면 상태에 남기지 않는다.
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setIsChanged(true);
    } catch (error) {
      // 현재 비밀번호가 틀린 401 은 그 칸에 바로 보여준다.
      if (error instanceof ApiError && error.status === 401) {
        setErrors({ currentPassword: error.message });
        return;
      }

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
      <PageTitle id={titleId}>비밀번호 변경</PageTitle>

      <FormCard
        id={formId}
        noValidate
        onSubmit={(event) => void handleSubmit(event)}
      >
        <FormSectionTitle>새 비밀번호 설정</FormSectionTitle>
        <GuidanceText>
          현재 비밀번호를 확인한 뒤 새 비밀번호로 변경합니다.
        </GuidanceText>
        <FieldStack>
          <TextInput
            id={currentPasswordId}
            name="currentPassword"
            type="password"
            label="현재 비밀번호"
            placeholder="현재 비밀번호를 입력해주세요"
            value={currentPassword}
            error={errors.currentPassword}
            autoComplete="current-password"
            showPasswordToggle
            onChange={(value) => {
              setCurrentPassword(value);
              setErrors((currentErrors) => ({
                ...currentErrors,
                currentPassword: undefined,
              }));
            }}
          />
          <TextInput
            id={newPasswordId}
            name="newPassword"
            type="password"
            label="새 비밀번호"
            placeholder={`${INITIAL_PASSWORD_MIN_LENGTH}자 이상 ${INITIAL_PASSWORD_MAX_LENGTH}자 이하로 입력해주세요`}
            value={newPassword}
            error={errors.newPassword}
            autoComplete="new-password"
            showPasswordToggle
            onChange={(value) => {
              setNewPassword(value);
              setErrors((currentErrors) => ({
                ...currentErrors,
                newPassword: undefined,
              }));
            }}
          />
          <TextInput
            id={newPasswordConfirmId}
            name="newPasswordConfirm"
            type="password"
            label="새 비밀번호 확인"
            placeholder="새 비밀번호를 한 번 더 입력해주세요"
            value={newPasswordConfirm}
            error={errors.newPasswordConfirm}
            autoComplete="new-password"
            showPasswordToggle
            onChange={(value) => {
              setNewPasswordConfirm(value);
              setErrors((currentErrors) => ({
                ...currentErrors,
                newPasswordConfirm: undefined,
              }));
            }}
          />
        </FieldStack>

        {isMeLoading && (
          <GuidanceText role="status">
            계정 정보를 확인하는 중입니다. 잠시 후 변경할 수 있습니다.
          </GuidanceText>
        )}
        {!isMeLoading && !me && (
          <MeErrorRow>
            <SubmissionError role="alert">
              계정 정보를 불러오지 못해 비밀번호를 변경할 수 없습니다.
            </SubmissionError>
            <Button
              variant="tertiary"
              size="small"
              type="button"
              onClick={retryLoadMe}
            >
              다시 시도
            </Button>
          </MeErrorRow>
        )}
        {submissionError && (
          <SubmissionError role="alert">{submissionError}</SubmissionError>
        )}
        {isChanged && (
          <GuidanceText role="status">
            비밀번호가 변경되었습니다. 다음 로그인부터 새 비밀번호를 사용해 주세요.
          </GuidanceText>
        )}
      </FormCard>

      <PageActionRow>
        <PageActionButton
          variant="tertiary"
          size="xlarge"
          type="button"
          onClick={goBack}
        >
          이전으로
        </PageActionButton>
        <PageActionButton
          variant="primary"
          size="xlarge"
          type="submit"
          form={formId}
          disabled={!me || isSubmitting || isChanged}
        >
          {isSubmitting ? "변경 중..." : "비밀번호 변경"}
        </PageActionButton>
      </PageActionRow>
    </WorkflowRoot>
  );
}

export default PasswordChangePage;
