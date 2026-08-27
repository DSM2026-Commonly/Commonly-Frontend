import { IntegratedRegistrationNotice } from "@commonly/ui";
import { useNavigate } from "react-router";

function IntegratedRegistrationNoticePage() {
  const navigate = useNavigate();

  return (
    <IntegratedRegistrationNotice
      onPrevious={() => void navigate("/career/register")}
      onNext={() => void navigate("/career/register/bulk/upload")}
    />
  );
}

export default IntegratedRegistrationNoticePage;
