import { IntegratedRegistrationUpload } from "@commonly/ui";
import {
  clearRegistrationSession,
  getAuthToken,
  getUploadErrorMessage,
  updateRegistrationSession,
  uploadFile,
} from "@commonly/utils";
import { useState } from "react";
import { useNavigate } from "react-router";

function IntegratedRegistrationUploadPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileUpload = async (file: File) => {
    setErrorMessage("");
    clearRegistrationSession();

    try {
      const uploadedFile = await uploadFile(file, { token: getAuthToken() });

      if (!updateRegistrationSession({ uploadedFile })) {
        throw new Error(
          "브라우저 저장소를 사용할 수 없어 업로드한 파일 정보를 저장할 수 없습니다.",
        );
      }
    } catch (error) {
      setErrorMessage(getUploadErrorMessage(error));
      throw error;
    }
  };

  return (
    <IntegratedRegistrationUpload
      errorMessage={errorMessage}
      onFileUpload={handleFileUpload}
      onFileDelete={() => {
        setErrorMessage("");
        clearRegistrationSession();
      }}
      onPrevious={() => void navigate("/career/register/bulk")}
      onNext={() => void navigate("/career/register/bulk/confirm")}
    />
  );
}

export default IntegratedRegistrationUploadPage;
