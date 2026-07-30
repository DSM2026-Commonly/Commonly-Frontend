import { IntegratedRegistrationConfirm } from "@commonly/ui";
import { useNavigate } from "react-router";

function IntegratedRegistrationConfirmPage() {
  const navigate = useNavigate();

  return (
    <IntegratedRegistrationConfirm
      onPrevious={() => void navigate("/career/register/bulk/upload")}
      onNext={() => void navigate("/career/register/bulk/preview")}
    />
  );
}

export default IntegratedRegistrationConfirmPage;
