import {
  IndividualRegistrationCareer,
  type IndividualRegistrationCareerData,
  type IndividualRegistrationSubjectData,
} from "@commonly/ui";
import {
  ApiError,
  createCertificate,
  getAuthToken,
  type CreateCertificateRequest,
} from "@commonly/utils";
import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";

interface IndividualRegistrationCareerState {
  subject?: IndividualRegistrationSubjectData;
}

function toIsoDate(year: string, month: string, day: string): string {
  return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

// 화면 입력값을 POST /api/certificates/create 요청 본문으로 바꾼다.
// 주소지는 명세에 없어 보내지 않는다. 화면에 입력란이 없는 값은 null/빈 문자열로 둔다.
function toCreateRequest(
  subject: IndividualRegistrationSubjectData,
  career: IndividualRegistrationCareerData,
): CreateCertificateRequest {
  return {
    name: subject.name.trim(),
    birthDate: toIsoDate(subject.birthYear, subject.birthMonth, subject.birthDay),
    gender: subject.gender === "female" ? "F" : "M",
    jobTitle: career.jobTitle.trim(),
    keyResponsibilities: career.duties.trim(),
    hireDate: toIsoDate(career.startYear, career.startMonth, career.startDay),
    expirationDate: null,
    retirementDate: career.endYear
      ? toIsoDate(career.endYear, career.endMonth, career.endDay)
      : null,
    division: career.department.trim(),
    reason: career.resignationReason.trim(),
    employmentType: "",
    note: career.note.trim(),
  };
}

function IndividualRegistrationCareerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as IndividualRegistrationCareerState | null;
  const subject = state?.subject;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  if (!subject) {
    return <Navigate to="/career/register/individual/subject" replace />;
  }

  const handleSubmit = async (career: IndividualRegistrationCareerData) => {
    if (isSubmitting) {
      return;
    }

    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await createCertificate(toCreateRequest(subject, career), {
        token: getAuthToken(),
        signal: abortController.signal,
      });

      void navigate("/career/register/individual/complete", {
        state: { subjectName: subject.name, duties: career.duties },
      });
    } catch (error) {
      if (abortController.signal.aborted) {
        return;
      }

      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "경력사항 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      if (abortControllerRef.current === abortController) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <IndividualRegistrationCareer
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      onPrevious={() => void navigate("/career/register/individual/subject")}
      onSubmit={(career) => void handleSubmit(career)}
    />
  );
}

export default IndividualRegistrationCareerPage;
