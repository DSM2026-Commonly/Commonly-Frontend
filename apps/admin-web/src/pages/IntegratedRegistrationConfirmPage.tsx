import {
  IntegratedRegistrationConfirm,
  type IntegratedRegistrationConfirmMapping,
} from "@commonly/ui";
import {
  confirmFileMapping,
  getAuthToken,
  getRegistrationSession,
  suggestFileMappings,
  updateRegistrationSession,
  type CertificateTargetFieldId,
  type FileMapping,
} from "@commonly/utils";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

const COLUMN_PLACEHOLDER = "열 선택";

function toFileMappings(
  mappings: IntegratedRegistrationConfirmMapping[],
): FileMapping[] {
  return mappings.map((mapping) => ({
    sourceColumn: mapping.selectedRow,
    targetField: mapping.fieldId as CertificateTargetFieldId,
  }));
}

function IntegratedRegistrationConfirmPage() {
  const navigate = useNavigate();
  const [session] = useState(getRegistrationSession);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const uploadedFile = session.uploadedFile;
  // 진행 중인 등록 요청. 페이지 이탈이나 새 흐름 시작 시 이전 요청을 무효화해
  // 늦게 완료된 요청이 세션에 result를 저장하거나 완료 페이지로 이동하지 못하게 한다.
  const confirmControllerRef = useRef<AbortController | null>(null);

  const abortPendingConfirm = () => {
    confirmControllerRef.current?.abort();
    confirmControllerRef.current = null;
  };

  useEffect(() => abortPendingConfirm, []);

  useEffect(() => {
    if (!uploadedFile) {
      void navigate("/career/register/bulk/upload", { replace: true });
    }
  }, [navigate, uploadedFile]);

  if (!uploadedFile) {
    return null;
  }

  const handleNext = async (
    confirmMappings: IntegratedRegistrationConfirmMapping[],
  ) => {
    const mappings = toFileMappings(confirmMappings);

    abortPendingConfirm();
    const controller = new AbortController();
    confirmControllerRef.current = controller;

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const result = await confirmFileMapping(uploadedFile.fileId, mappings, {
        confirmed: true,
        token: getAuthToken(),
        signal: controller.signal,
      });

      // 요청이 현재 흐름에 속하지 않으면 세션 저장과 완료 페이지 이동을 건너뛴다.
      if (controller.signal.aborted) {
        return;
      }

      // 세션 저장에 실패하더라도 등록 API는 이미 성공했으므로
      // 완료 페이지가 결과를 읽을 수 있도록 라우터 state로 함께 전달한다.
      const isSaved = updateRegistrationSession({ mappings, result });
      void navigate("/career/register/bulk/complete", {
        replace: true,
        state: isSaved ? undefined : { result, uploadedFile },
      });
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "경력사항 등록 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      if (confirmControllerRef.current === controller) {
        confirmControllerRef.current = null;
        setIsSubmitting(false);
      }
    }
  };

  return (
    <IntegratedRegistrationConfirm
      rowOptions={[COLUMN_PLACEHOLDER, ...uploadedFile.columns]}
      initialSelections={suggestFileMappings(uploadedFile.columns)}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      nextLabel="등록하기"
      onPrevious={() => {
        abortPendingConfirm();
        void navigate("/career/register/bulk/upload");
      }}
      onNext={handleNext}
    />
  );
}

export default IntegratedRegistrationConfirmPage;
