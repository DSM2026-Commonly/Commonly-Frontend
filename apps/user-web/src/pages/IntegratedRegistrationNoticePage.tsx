import { IntegratedRegistrationNotice } from "@commonly/ui";
import { updateRegistrationSession } from "@commonly/utils";
import { useState } from "react";
import { useNavigate } from "react-router";

const NOTICE_SAVE_FAILED_MESSAGE =
  "동의 상태를 저장하지 못했습니다. 브라우저 저장소가 차단되어 있는지 확인한 뒤 다시 시도해 주세요.";

function IntegratedRegistrationNoticePage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <IntegratedRegistrationNotice
      errorMessage={errorMessage}
      onPrevious={() => void navigate("/career/register")}
      onNext={() => {
        // 업로드 페이지 가드가 이 동의 기록을 본다. 저장에 실패한 채 넘기면
        // 가드가 곧바로 이 페이지로 돌려보내 사용자는 이유를 알 수 없다.
        if (!updateRegistrationSession({ noticeAgreed: true })) {
          setErrorMessage(NOTICE_SAVE_FAILED_MESSAGE);
          return;
        }

        void navigate("/career/register/bulk/upload");
      }}
    />
  );
}

export default IntegratedRegistrationNoticePage;
