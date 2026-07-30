import { IntegratedRegistrationUpload } from "@commonly/ui";
import { useNavigate } from "react-router";

function IntegratedRegistrationUploadPage() {
  const navigate = useNavigate();

  return (
    <IntegratedRegistrationUpload
      onPrevious={() => void navigate("/career/register/bulk")}
      onNext={() => void navigate("/career/register/bulk/confirm")}
    />
  );
}

export default IntegratedRegistrationUploadPage;
