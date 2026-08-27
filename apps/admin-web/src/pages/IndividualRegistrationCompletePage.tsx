import { IndividualRegistrationComplete } from "@commonly/ui";
import { Navigate, useLocation, useNavigate } from "react-router";

interface IndividualRegistrationCompleteState {
  subjectName?: string;
  duties?: string;
}

function IndividualRegistrationCompletePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as IndividualRegistrationCompleteState | null;

  if (!state) {
    return <Navigate to="/career/register/individual" replace />;
  }

  return (
    <IndividualRegistrationComplete
      subjectName={state?.subjectName}
      duties={state?.duties}
      onAdd={() => void navigate("/career/register")}
      onHome={() => void navigate("/")}
    />
  );
}

export default IndividualRegistrationCompletePage;
