import {
  IndividualRegistrationCareer,
  type IndividualRegistrationCareerData,
  type IndividualRegistrationSubjectData,
} from "@commonly/ui";
import {
  ApiError,
  createCertificate,
  createHuman,
  getAuthToken,
  updateHuman,
  type CreateCertificateRequest,
  type CreateHumanRequest,
} from "@commonly/utils";
import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";

interface IndividualRegistrationCareerState {
  subject?: IndividualRegistrationSubjectData;
}

function toIsoDate(year: string, month: string, day: string): string {
  return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

// 대상자 단계 입력값을 POST/PUT /api/human 요청 본문으로 바꾼다.
// 근무부서는 경력 단계에서 입력받으므로 경력 값을 대상자의 부서로 함께 보낸다.
function toHumanRequest(
  subject: IndividualRegistrationSubjectData,
  career: IndividualRegistrationCareerData,
): CreateHumanRequest {
  return {
    name: subject.name.trim(),
    gender: subject.gender === "female" ? "F" : "M",
    birthDate: toIsoDate(
      subject.birthYear,
      subject.birthMonth,
      subject.birthDay,
    ),
    address: subject.address.trim() || null,
    department: career.department.trim(),
  };
}

// 화면 입력값을 POST /api/certificates/create 요청 본문으로 바꾼다.
// 화면에 입력란이 없는 값은 null/빈 문자열로 둔다.
function toCreateRequest(
  humanId: number,
  subject: IndividualRegistrationSubjectData,
  career: IndividualRegistrationCareerData,
): CreateCertificateRequest {
  return {
    humanId,
    name: subject.name.trim(),
    birthDate: toIsoDate(
      subject.birthYear,
      subject.birthMonth,
      subject.birthDay,
    ),
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

// 중복 확인에서 "기존 대상자"를 고른 경우 그 id 를 돌려준다.
function getExistingHumanId(
  subject: IndividualRegistrationSubjectData,
): number | null {
  if (
    subject.duplicateResolution !== "existing" ||
    !subject.existingSubjectId
  ) {
    return null;
  }

  const humanId = Number(subject.existingSubjectId);
  return Number.isInteger(humanId) && humanId > 0 ? humanId : null;
}

function IndividualRegistrationCareerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as IndividualRegistrationCareerState | null;
  const subject = state?.subject;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  // 대상자 등록이 끝난 뒤 경력 등록만 실패했을 때 재시도해도 대상자가 중복 생성되지 않도록 기억한다.
  const registeredHumanIdRef = useRef<number | null>(null);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  if (!subject) {
    return <Navigate to="/career/register/individual/subject" replace />;
  }

  // 기존 대상자를 골랐으면 그 id 를 쓰고(주소를 새로 입력했을 때만 인적사항 갱신),
  // 아니면 새 대상자를 만든다.
  const resolveHumanId = async (
    career: IndividualRegistrationCareerData,
    signal: AbortSignal,
  ): Promise<number> => {
    if (registeredHumanIdRef.current !== null) {
      return registeredHumanIdRef.current;
    }

    const token = getAuthToken();
    const humanRequest = toHumanRequest(subject, career);
    const existingHumanId = getExistingHumanId(subject);

    if (existingHumanId !== null) {
      if (humanRequest.address) {
        await updateHuman(existingHumanId, humanRequest, { token, signal });
      }

      registeredHumanIdRef.current = existingHumanId;
      return existingHumanId;
    }

    const { humanId } = await createHuman(humanRequest, { token, signal });
    registeredHumanIdRef.current = humanId;
    return humanId;
  };

  const handleSubmit = async (career: IndividualRegistrationCareerData) => {
    if (isSubmitting) {
      return;
    }

    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setIsSubmitting(true);
    setErrorMessage("");

    let isHumanRegistered = false;

    try {
      const humanId = await resolveHumanId(career, abortController.signal);
      isHumanRegistered = true;

      await createCertificate(toCreateRequest(humanId, subject, career), {
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

      const message =
        error instanceof ApiError
          ? error.message
          : "경력사항 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";

      setErrorMessage(
        isHumanRegistered
          ? `대상자 등록은 완료되었습니다. 경력사항 등록에 실패했습니다: ${message}`
          : message,
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
