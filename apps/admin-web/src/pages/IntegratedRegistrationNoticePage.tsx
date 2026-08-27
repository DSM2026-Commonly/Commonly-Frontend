import { IntegratedRegistrationNotice } from "@commonly/ui";
import { useNavigate } from "react-router";

function IntegratedRegistrationNoticePage() {
  const navigate = useNavigate();

  return (
    <IntegratedRegistrationNotice
      // admin 은 이 화면이 등록 흐름의 첫 화면이므로 이전은 홈으로 보낸다.
      onPrevious={() => void navigate("/")}
      onNext={() => void navigate("/career/register/bulk/upload")}
    />
  );
}

export default IntegratedRegistrationNoticePage;
