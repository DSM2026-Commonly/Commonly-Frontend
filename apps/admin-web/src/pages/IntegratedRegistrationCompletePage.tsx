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
        // 엑셀에만 있던 대상자는 인적사항을 새로 만든다. 성명 오타도 새 사람이 되므로 수를 확인하게 한다.
        {
          id: "created",
          label: "신규 인적사항",
          // 세션에 남은 예전 결과에는 이 값이 없을 수 있다.
          value: `${result.createdHumanCount ?? 0}명`,
        },
      ]}
      failures={result.failedRows}
      onAdd={() => leaveFlow("/career/register")}
      onHome={() => leaveFlow("/")}
    />
  );
}

export default IntegratedRegistrationCompletePage;
