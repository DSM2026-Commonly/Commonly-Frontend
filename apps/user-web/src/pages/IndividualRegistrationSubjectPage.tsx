import {
  IndividualRegistrationSubject,
  type IndividualRegistrationSubjectData,
} from "@commonly/ui";
import { useNavigate } from "react-router";

function IndividualRegistrationSubjectPage() {
  const navigate = useNavigate();

  return (
    <IndividualRegistrationSubject
      onPrevious={() => void navigate("/career/register/individual")}
      onNext={(subject: IndividualRegistrationSubjectData) =>
        void navigate("/career/register/individual/career", {
          state: { subject },
        })
      }
    />
  );
}

export default IndividualRegistrationSubjectPage;
