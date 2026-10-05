import { IntegratedRegistrationNotice } from "@commonly/ui";
import { updateRegistrationSession } from "@commonly/utils";
import { useNavigate } from "react-router";

function IntegratedRegistrationNoticePage() {
  const navigate = useNavigate();

  return (
    <IntegratedRegistrationNotice
      onPrevious={() => void navigate("/career/register")}
      onNext={() => {
        updateRegistrationSession({ noticeAgreed: true });
        void navigate("/career/register/bulk/upload");
      }}
    />
  );
}

export default IntegratedRegistrationNoticePage;
