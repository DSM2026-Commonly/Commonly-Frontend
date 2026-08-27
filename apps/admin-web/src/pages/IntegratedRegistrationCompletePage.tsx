import { IntegratedRegistrationComplete } from "@commonly/ui";
import {
  clearRegistrationSession,
  getRegistrationSession,
  type IntegratedRegistrationSession,
} from "@commonly/utils";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

type CompleteLocationState = Pick<
  IntegratedRegistrationSession,
  "result" | "uploadedFile"
> | null;

function IntegratedRegistrationCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session] = useState(getRegistrationSession);
  // 세션 저장 실패 시 이전 페이지가 라우터 state로 전달한 결과를 대체 경로로 사용한다.
  const fallback = location.state as CompleteLocationState;
  const result = session.result ?? fallback?.result;
  const uploadedFile = session.uploadedFile ?? fallback?.uploadedFile;

  useEffect(() => {
    if (!result) {
      void navigate("/career/register/bulk/upload", { replace: true });
    }
  }, [navigate, result]);

  if (!result) {
    return null;
  }

  const failureCount = result.failedRows.length;
  const totalCount = uploadedFile?.rows.length ?? result.insertedCount + failureCount;

  const leaveFlow = (path: string) => {
    clearRegistrationSession();
    void navigate(path);
  };

  return (
    <IntegratedRegistrationComplete
      results={[
        { id: "total", label: "대상 건수", value: `${totalCount}건` },
        { id: "success", label: "성공 건수", value: `${result.insertedCount}건` },
        { id: "failure", label: "실패 건수", value: `${failureCount}건` },
      ]}
      onAdd={() => leaveFlow("/career/register/bulk")}
      onHome={() => leaveFlow("/")}
    />
  );
}

export default IntegratedRegistrationCompletePage;
