import { IntegratedRegistrationPreview } from "@commonly/ui";
import { useNavigate } from "react-router";

function IntegratedRegistrationPreviewPage() {
  const navigate = useNavigate();

  return (
    <IntegratedRegistrationPreview
      onPrevious={() => void navigate("/career/register/bulk/confirm")}
      onNext={() => void navigate("/career/register/bulk/complete")}
    />
  );
}

export default IntegratedRegistrationPreviewPage;
