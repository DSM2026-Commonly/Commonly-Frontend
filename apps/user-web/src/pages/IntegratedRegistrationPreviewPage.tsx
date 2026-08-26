import {
  IntegratedRegistrationPreview,
  type IntegratedRegistrationPreviewField,
} from "@commonly/ui";
import {
  CERTIFICATE_TARGET_FIELDS,
  confirmFileMapping,
  getAuthToken,
  getMappedRowValues,
  getRegistrationSession,
  updateRegistrationSession,
} from "@commonly/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

function IntegratedRegistrationPreviewPage() {
  const navigate = useNavigate();
  const [session] = useState(getRegistrationSession);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { uploadedFile, mappings } = session;
  const isReady = Boolean(uploadedFile && mappings?.length);

  useEffect(() => {
    if (!isReady) {
      void navigate("/career/register/bulk/upload", { replace: true });
    }
  }, [isReady, navigate]);

  if (!uploadedFile || !mappings?.length) {
    return null;
  }

  const firstRowValues = getMappedRowValues(uploadedFile, mappings);
  const fields: IntegratedRegistrationPreviewField[] =
    CERTIFICATE_TARGET_FIELDS.map((field) => ({
      id: field.id,
      label: field.label,
      value: firstRowValues[field.id] ?? "",
    }));

  const handleNext = async () => {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const result = await confirmFileMapping(uploadedFile.fileId, mappings, {
        confirmed: true,
        token: getAuthToken(),
      });

      // 세션 저장에 실패하더라도 등록 API는 이미 성공했으므로
      // 완료 페이지가 결과를 읽을 수 있도록 라우터 state로 함께 전달한다.
      const isSaved = updateRegistrationSession({ result });
      void navigate("/career/register/bulk/complete", {
        replace: true,
        state: isSaved ? undefined : { result, uploadedFile },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "경력사항 등록 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IntegratedRegistrationPreview
      fields={fields}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      nextLabel="등록하기"
      onPrevious={() => void navigate("/career/register/bulk/confirm")}
      onNext={handleNext}
    />
  );
}

export default IntegratedRegistrationPreviewPage;
