import {
  IntegratedRegistrationConfirm,
  type IntegratedRegistrationConfirmMapping,
} from "@commonly/ui";
import {
  getRegistrationSession,
  suggestFileMappings,
  updateRegistrationSession,
  type CertificateTargetFieldId,
  type FileMapping,
} from "@commonly/utils";
import { useEffect, useState } from "react";
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
  const [errorMessage, setErrorMessage] = useState("");
  const uploadedFile = session.uploadedFile;

  useEffect(() => {
    if (!uploadedFile) {
      void navigate("/career/register/bulk/upload", { replace: true });
    }
  }, [navigate, uploadedFile]);

  if (!uploadedFile) {
    return null;
  }

  const initialSelections = Object.fromEntries(
    (session.mappings ?? []).map((mapping) => [
      mapping.targetField,
      mapping.sourceColumn,
    ]),
  );

  const handleNext = (mappings: IntegratedRegistrationConfirmMapping[]) => {
    setErrorMessage("");

    if (!updateRegistrationSession({ mappings: toFileMappings(mappings) })) {
      setErrorMessage(
        "브라우저 저장소를 사용할 수 없어 매핑 정보를 저장할 수 없습니다.",
      );
      return;
    }

    void navigate("/career/register/bulk/preview");
  };

  return (
    <IntegratedRegistrationConfirm
      rowOptions={[COLUMN_PLACEHOLDER, ...uploadedFile.columns]}
      initialSelections={
        session.mappings
          ? initialSelections
          : suggestFileMappings(uploadedFile.columns)
      }
      errorMessage={errorMessage}
      onPrevious={() => void navigate("/career/register/bulk/upload")}
      onNext={handleNext}
    />
  );
}

export default IntegratedRegistrationConfirmPage;
