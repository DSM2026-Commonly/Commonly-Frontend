import "krds-react/dist/index.css";

import type { FormEvent } from "react";
import { useId, useState } from "react";
import { TextInput } from "krds-react";
import {
  FieldStack,
  FormCard,
  FormSectionTitle,
  PageActionButton,
  PageActionRow,
  PageTitle,
  SubmissionError,
  WorkflowRoot,
} from "./userManagement.styles";

export interface UserRegistrationData {
  name: string;
  accountId: string;
  department: string;
}

export interface UserRegistrationProps {
  initialValues?: Partial<UserRegistrationData>;
  onPrevious?: () => void;
  onSubmit: (data: UserRegistrationData) => void | Promise<void>;
}

interface UserRegistrationErrors {
  name?: string;
  accountId?: string;
  department?: string;
}

function UserRegistration({
  initialValues,
  onPrevious,
  onSubmit,
}: UserRegistrationProps) {
  const titleId = useId();
  const formId = useId();
  const nameId = useId();
  const accountIdInputId = useId();
  const departmentId = useId();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [accountId, setAccountId] = useState(
    initialValues?.accountId ?? "",
  );
  const [department, setDepartment] = useState(
    initialValues?.department ?? "",
  );
  const [errors, setErrors] = useState<UserRegistrationErrors>({});
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedData: UserRegistrationData = {
      name: name.trim(),
      accountId: accountId.trim(),
      department: department.trim(),
    };
    const nextErrors: UserRegistrationErrors = {};

    if (!normalizedData.name) {
      nextErrors.name = "이름을 입력해 주세요.";
    }

    if (!normalizedData.accountId) {
      nextErrors.accountId = "아이디를 입력해 주세요.";
    }

    if (!normalizedData.department) {
      nextErrors.department = "소속 부서를 입력해 주세요.";
    }

    setErrors(nextErrors);
    setSubmissionError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(normalizedData);
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "사용자 등록 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WorkflowRoot aria-labelledby={titleId}>
      <PageTitle id={titleId}>사용자 등록</PageTitle>

      <FormCard
        id={formId}
        noValidate
        onSubmit={(event) => void handleSubmit(event)}
      >
        <FormSectionTitle>사용자 등록</FormSectionTitle>
        <FieldStack>
          <TextInput
            id={nameId}
            name="name"
            label="이름"
            placeholder="이름을 입력해주세요"
            value={name}
            error={errors.name}
            autoComplete="name"
            onChange={(value) => {
              setName(value);
              setErrors((currentErrors) => ({
                ...currentErrors,
                name: undefined,
              }));
            }}
          />
          <TextInput
            id={accountIdInputId}
            name="accountId"
            label="아이디"
            placeholder="아이디를 입력해주세요"
            value={accountId}
            error={errors.accountId}
            autoComplete="username"
            onChange={(value) => {
              setAccountId(value);
              setErrors((currentErrors) => ({
                ...currentErrors,
                accountId: undefined,
              }));
            }}
          />
          <TextInput
            id={departmentId}
            name="department"
            label="소속 부서"
            placeholder="소속 부서를 입력해주세요"
            value={department}
            error={errors.department}
            autoComplete="organization"
            onChange={(value) => {
              setDepartment(value);
              setErrors((currentErrors) => ({
                ...currentErrors,
                department: undefined,
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
          variant="tertiary"
          size="xlarge"
          type="button"
          onClick={onPrevious}
        >
          이전으로
        </PageActionButton>
        <PageActionButton
          variant="primary"
          size="xlarge"
          type="submit"
          form={formId}
          disabled={isSubmitting}
        >
          {isSubmitting ? "등록 중..." : "등록하기"}
        </PageActionButton>
      </PageActionRow>
    </WorkflowRoot>
  );
}

export default UserRegistration;
