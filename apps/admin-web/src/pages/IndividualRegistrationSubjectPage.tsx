import {
  IndividualRegistrationSubject,
  searchRoadAddresses,
  type IndividualRegistrationDuplicateCandidate,
  type IndividualRegistrationSubjectData,
} from "@commonly/ui";
import { getAuthToken, searchHumans } from "@commonly/utils";
import { useNavigate } from "react-router";

// 이름 + 생년월일이 같은 기존 대상자를 서버에서 찾아 중복 후보로 보여준다.
async function findDuplicateSubjects(
  subject: Omit<
    IndividualRegistrationSubjectData,
    "duplicateResolution" | "existingSubjectId"
  >,
): Promise<IndividualRegistrationDuplicateCandidate[]> {
  const birthDate = `${subject.birthYear}-${subject.birthMonth}-${subject.birthDay}`;
  const humans = await searchHumans(
    { name: subject.name, birthDateFrom: birthDate, birthDateTo: birthDate },
    { token: getAuthToken() },
  );

  return humans.map((human) => {
    const [birthYear = "", birthMonth = "", birthDay = ""] =
      human.birthDate.split("-");

    return {
      id: String(human.humanId),
      name: human.name,
      gender: human.gender === "F" ? "female" : "male",
      birthYear,
      birthMonth,
      birthDay,
      address: human.address,
    };
  });
}

function IndividualRegistrationSubjectPage() {
  const navigate = useNavigate();

  return (
    <IndividualRegistrationSubject
      onSearchAddress={searchRoadAddresses}
      onCheckDuplicate={findDuplicateSubjects}
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
