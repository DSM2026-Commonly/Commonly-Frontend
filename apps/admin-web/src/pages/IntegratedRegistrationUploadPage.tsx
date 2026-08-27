import { IntegratedRegistrationUpload } from "@commonly/ui";
import {
  clearRegistrationSession,
  getAuthToken,
  getRegistrationSession,
  getUploadErrorMessage,
  updateRegistrationSession,
  uploadFile,
} from "@commonly/utils";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

function IntegratedRegistrationUploadPage() {
  const navigate = useNavigate();
  // 새로고침/뒤로가기로 돌아온 경우 세션의 업로드 결과를 복원해 재업로드를 요구하지 않는다.
  const [initialSession] = useState(getRegistrationSession);
  const [errorMessage, setErrorMessage] = useState("");
  // 진행 중인 업로드 요청. 삭제/새 업로드/페이지 이탈 시 이전 요청을 무효화해
  // 늦게 완료된 요청이 새 등록 세션을 덮어쓰지 못하게 한다.
  const uploadControllerRef = useRef<AbortController | null>(null);

  const abortPendingUpload = () => {
    uploadControllerRef.current?.abort();
    uploadControllerRef.current = null;
  };

  useEffect(() => abortPendingUpload, []);

  const handleFileUpload = async (file: File) => {
    abortPendingUpload();
    const controller = new AbortController();
    uploadControllerRef.current = controller;

    setErrorMessage("");
    clearRegistrationSession();

    try {
      const uploadedFile = await uploadFile(file, {
        token: getAuthToken(),
        signal: controller.signal,
      });

      // 요청 중 삭제/새 업로드/페이지 이탈로 무효화된 경우 세션을 덮어쓰지 않는다.
      // 컴포넌트가 이 파일을 "완료"로 표시하지 않도록 reject 한다.
      if (controller.signal.aborted) {
        throw new DOMException("업로드 요청이 취소되었습니다.", "AbortError");
      }

      if (!updateRegistrationSession({ uploadedFile })) {
        throw new Error(
          "브라우저 저장소를 사용할 수 없어 업로드한 파일 정보를 저장할 수 없습니다.",
        );
      }
    } catch (error) {
      // 무효화된 요청의 오류는 현재 흐름과 무관하므로 화면에 표시하지 않는다.
      if (!controller.signal.aborted) {
        setErrorMessage(getUploadErrorMessage(error));
      }
      throw error;
    } finally {
      if (uploadControllerRef.current === controller) {
        uploadControllerRef.current = null;
      }
    }
  };

  return (
    <IntegratedRegistrationUpload
      errorMessage={errorMessage}
      initialFileName={initialSession.uploadedFile?.fileName}
      onFileUpload={handleFileUpload}
      onFileDelete={(_fileId, remainingFiles) => {
        abortPendingUpload();
        setErrorMessage("");

        // 완료된 업로드가 목록에 남아 있으면 세션을 유지한다. 업로드 완료 직후
        // 늦게 커밋된 목록 교체가 삭제로 오인되어 방금 저장한 세션을 지우는
        // 레이스를 막기 위한 가드다.
        const hasRemainingUpload = remainingFiles.some(
          (file) => file.status === "completed" || file.status === "ready",
        );

        if (!hasRemainingUpload) {
          clearRegistrationSession();
        }
      }}
      onPrevious={() => void navigate("/career/register/bulk")}
      onNext={() => void navigate("/career/register/bulk/confirm")}
    />
  );
}

export default IntegratedRegistrationUploadPage;
