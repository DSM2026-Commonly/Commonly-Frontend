import { IntegratedRegistrationComplete } from "@commonly/ui";
import {
  clearRegistrationSession,
  getRegistrationSession,
} from "@commonly/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

function IntegratedRegistrationCompletePage() {
  const navigate = useNavigate();
  const [session] = useState(getRegistrationSession);
  const { uploadedFile, result } = session;

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
