import { IntegratedRegistrationComplete } from "@commonly/ui";
import { useNavigate } from "react-router";

function IntegratedRegistrationCompletePage() {
  const navigate = useNavigate();

  return (
    <IntegratedRegistrationComplete
      onAdd={() => void navigate("/career/register")}
      onHome={() => void navigate("/")}
    />
  );
}

export default IntegratedRegistrationCompletePage;
