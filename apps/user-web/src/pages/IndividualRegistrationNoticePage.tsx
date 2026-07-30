import { IntegratedRegistrationNotice } from "@commonly/ui";
import { useNavigate } from "react-router";

const individualRegistrationSteps = [
  { id: "notice", title: "유의사항 확인" },
  { id: "subject", title: "대상자 입력" },
  { id: "career", title: "경력사항 입력" },
] as const;

function IndividualRegistrationNoticePage() {
  const navigate = useNavigate();

  return (
    <IntegratedRegistrationNotice
      variant="individual"
      title="경력사항 개별 등록"
      steps={individualRegistrationSteps}
      onPrevious={() => void navigate("/career/register")}
      onNext={() => void navigate("/career/register/individual/subject")}
    />
  );
}

export default IndividualRegistrationNoticePage;
