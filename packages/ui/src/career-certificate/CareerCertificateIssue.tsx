import { useEffect, useRef, useState } from "react";
import { getStepIndex, STEP_VIEWS } from "./CareerCertificateIssue.constants";
import {
  FlowError,
  FlowLoading,
  FlowRoot,
} from "./CareerCertificateIssue.styles";
import type {
  CareerCertificateApplicationData,
  CareerCertificateIssueProps,
  CareerCertificateIssueView,
  CertificateApplicant,
  CertificateCareerRow,
  CertificateIssueType,
  IssuedCertificateSummary,
} from "./CareerCertificateIssue.types";
import {
  isValidBirthDate,
  sanitizeApplicantName,
  sanitizeDatePart,
} from "./CareerCertificateIssue.validation";
import ApplicantStep from "./steps/ApplicantStep";
import DetailsStep from "./steps/DetailsStep";
import NoticeStep from "./steps/NoticeStep";
import ReasonStep from "./steps/ReasonStep";
import useCareerCertificateScroll from "./useCareerCertificateScroll";
import CertificatePreviewView from "./views/CertificatePreviewView";
import CertificateSuccessView from "./views/CertificateSuccessView";
import CertificateWorkflowView from "./views/CertificateWorkflowView";
import CivilCertificateApplicationView from "./views/CivilCertificateApplicationView";

export type {
  CareerCertificateApplicationData,
  CareerCertificateIssueProps,
  CareerCertificateIssueVariant,
  CareerCertificateIssueView,
  CertificateApplicant,
  CertificateCareerRow,
  CertificateIssueType,
  IssuedCertificateSummary,
  RestoredIssuedCertificate,
} from "./CareerCertificateIssue.types";

const UNEXPECTED_ERROR_MESSAGE =
  "처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : UNEXPECTED_ERROR_MESSAGE;
}

function CareerCertificateIssue({
  initialView,
  variant = "staff",
  applicantName: fixedApplicantName = "",
  onCancel,
  onSearchApplicants,
  onLoadCareerRows,
  onComplete,
  onDownload,
  onRestoreIssued,
  onRestart,
}: CareerCertificateIssueProps) {
  const [view, setView] = useState<CareerCertificateIssueView>(
    initialView ?? (variant === "civil" ? "details" : "notice"),
  );
  const [noticeAccepted, setNoticeAccepted] = useState(false);
  const [reason, setReason] = useState("visit");
  const [note, setNote] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [hasPersonSearchResult, setHasPersonSearchResult] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [applicants, setApplicants] = useState<readonly CertificateApplicant[]>(
    [],
  );
  const [isSearchingApplicants, setIsSearchingApplicants] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [issueType, setIssueType] = useState<CertificateIssueType>("all");
  const [careerRows, setCareerRows] = useState<readonly CertificateCareerRow[]>(
    [],
  );
  const [isLoadingCareerRows, setIsLoadingCareerRows] = useState(false);
  const [stepError, setStepError] = useState("");
  const [selectedCareerIds, setSelectedCareerIds] = useState<string[]>([]);
  const [additionalNote, setAdditionalNote] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [issuedSummary, setIssuedSummary] =
    useState<IssuedCertificateSummary | null>(null);
  // 복구한 발급 건의 대상자명. 조회 결과가 없는 상태에서 완료 화면을 그릴 때 쓴다.
  const [restoredApplicantName, setRestoredApplicantName] = useState("");
  // 복구를 시도하는 동안에는 첫 단계가 잠깐 보였다 사라지지 않도록 안내만 띄운다.
  const [isRestoring, setIsRestoring] = useState(Boolean(onRestoreIssued));
  // 검색 중 입력이 바뀌어 리셋된 뒤 도착하는 이전 응답을 무시하기 위한 요청 id.
  const searchRequestIdRef = useRef(0);
  // 민원인 본인 경력 로딩 요청 id. 재시작으로 다시 불러올 때 이전 응답을 무시한다.
  const careerLoadRequestIdRef = useRef(0);
  const [civilLoadKey, setCivilLoadKey] = useState(0);

  const currentStep = getStepIndex(view);
  const canSearchPerson =
    applicantName.trim().length > 0 &&
    isValidBirthDate(birthYear, birthMonth, birthDay);
  const canContinue =
    (currentStep !== 0 || noticeAccepted) &&
    (currentStep !== 2 || Boolean(selectedPerson)) &&
    (currentStep !== 3 ||
      (careerRows.length > 0 &&
        (issueType === "all" || selectedCareerIds.length > 0) &&
        // 발급 용도는 증명서에 기재되는 필수 항목이다.
        purpose.trim().length > 0));
  const selectedApplicantName =
    applicants.find((applicant) => applicant.id === selectedPerson)?.name ??
    (restoredApplicantName || fixedApplicantName);
  const selectedCareerRows =
    issueType === "all"
      ? careerRows
      : careerRows.filter((row) => selectedCareerIds.includes(row.id));

  useCareerCertificateScroll(view);

  // 완료 화면에서 새로고침하거나 뒤로 갔다 돌아온 경우 직전 발급 결과를 되살린다.
  useEffect(() => {
    if (!onRestoreIssued) {
      return;
    }

    let isActive = true;

    onRestoreIssued()
      .then((restored) => {
        if (!isActive || !restored) {
          return;
        }

        setRestoredApplicantName(restored.applicantName);
        setIssueType(restored.issueType);
        setIssuedSummary({
          documentNo: restored.documentNo,
          issuedAt: restored.issuedAt,
        });
        setView("success");
      })
      .catch(() => {
        // 복구는 부가 기능이라 실패하면 조용히 처음부터 시작한다.
      })
      .finally(() => {
        if (isActive) {
          setIsRestoring(false);
        }
      });

    return () => {
      isActive = false;
    };
    // onRestoreIssued 는 페이지가 매 렌더마다 새로 만드는 콜백이라 의존성에서 제외한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 민원인은 대상자 조회 단계가 없으므로 진입 시 본인 경력을 바로 불러온다.
  useEffect(() => {
    if (variant !== "civil" || !onLoadCareerRows) {
      return;
    }

    const requestId = ++careerLoadRequestIdRef.current;
    let isActive = true;

    setIsLoadingCareerRows(true);
    setStepError("");

    onLoadCareerRows("")
      .then((rows) => {
        if (!isActive || requestId !== careerLoadRequestIdRef.current) {
          return;
        }

        setCareerRows(rows);
        setSelectedCareerIds(rows.map((row) => row.id));
      })
      .catch((error: unknown) => {
        if (!isActive || requestId !== careerLoadRequestIdRef.current) {
          return;
        }

        setStepError(getErrorMessage(error));
      })
      .finally(() => {
        if (isActive && requestId === careerLoadRequestIdRef.current) {
          setIsLoadingCareerRows(false);
        }
      });

    return () => {
      isActive = false;
    };
    // onLoadCareerRows 는 페이지가 매 렌더마다 새로 만드는 콜백이라 의존성에서 제외한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, civilLoadKey]);

  const moveToView = (nextView: CareerCertificateIssueView) => {
    setStepError("");
    setView(nextView);
  };

  const handlePrevious = () => {
    // 경력 로딩 중 이전 단계로 이동하면 로딩 완료 시 details 로 강제 이동되므로 막는다.
    if (isLoadingCareerRows) {
      return;
    }

    if (variant === "civil" && view === "details") {
      if (issueType === "selected") {
        setIssueType("all");
        return;
      }

      onCancel?.();
      return;
    }

    if (currentStep === 0) {
      onCancel?.();
      return;
    }

    moveToView(STEP_VIEWS[currentStep - 1]);
  };

  const handleNext = async () => {
    if (!canContinue || isLoadingCareerRows) {
      return;
    }

    if (view === "applicant" && onLoadCareerRows) {
      setStepError("");
      setIsLoadingCareerRows(true);

      try {
        const rows = await onLoadCareerRows(selectedPerson);
        setCareerRows(rows);
        setSelectedCareerIds(rows.map((row) => row.id));
      } catch (error) {
        setStepError(getErrorMessage(error));
        return;
      } finally {
        setIsLoadingCareerRows(false);
      }

      moveToView("details");
      return;
    }

    if (currentStep < STEP_VIEWS.length - 1) {
      moveToView(STEP_VIEWS[currentStep + 1]);
      return;
    }

    moveToView("preview");
  };

  const handlePreviewNext = async () => {
    if (isSubmitting) {
      return;
    }

    const applicationData: CareerCertificateApplicationData = {
      issueType,
      reason,
      note,
      applicantId: selectedPerson,
      applicantName,
      birthYear,
      birthMonth,
      birthDay,
      selectedCareerIds:
        issueType === "all"
          ? careerRows.map((row) => row.id)
          : selectedCareerIds,
      additionalNote,
      purpose,
    };

    if (!onComplete) {
      moveToView("success");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError("");

    try {
      const summary = await onComplete(applicationData);

      if (summary) {
        setIssuedSummary(summary);
      }

      moveToView("success");
    } catch (error) {
      setSubmissionError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCareerSelection = (id: string, checked: boolean) => {
    setSelectedCareerIds((currentIds) => {
      if (checked) {
        return currentIds.includes(id) ? currentIds : [...currentIds, id];
      }

      return currentIds.filter((currentId) => currentId !== id);
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedCareerIds(checked ? careerRows.map((row) => row.id) : []);
  };

  const handlePersonSearch = async () => {
    if (!canSearchPerson || isSearchingApplicants) {
      return;
    }

    if (!onSearchApplicants) {
      setSearchError("대상자 조회 기능이 연결되지 않았습니다.");
      return;
    }

    const requestId = ++searchRequestIdRef.current;

    setIsSearchingApplicants(true);
    setSearchError("");

    try {
      const birthDate = `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`;
      const result = await onSearchApplicants({
        name: applicantName.trim(),
        birthDate,
      });

      if (requestId !== searchRequestIdRef.current) {
        return;
      }

      setApplicants(result);
      setHasPersonSearchResult(true);
      setSelectedPerson(result.length === 1 ? result[0].id : "");
    } catch (error) {
      if (requestId !== searchRequestIdRef.current) {
        return;
      }

      setApplicants([]);
      setHasPersonSearchResult(false);
      setSelectedPerson("");
      setSearchError(getErrorMessage(error));
    } finally {
      setIsSearchingApplicants(false);
    }
  };

  const resetPersonSearchResult = () => {
    searchRequestIdRef.current += 1;
    setHasPersonSearchResult(false);
    setSelectedPerson("");
    setApplicants([]);
    setSearchError("");
  };

  const handleApplicantNameChange = (value: string) => {
    const sanitizedValue = sanitizeApplicantName(value);

    if (sanitizedValue === applicantName) {
      return;
    }

    setApplicantName(sanitizedValue);
    resetPersonSearchResult();
  };

  const handleBirthYearChange = (value: string) => {
    setBirthYear(value);
    resetPersonSearchResult();
  };

  const handleBirthMonthChange = (value: string) => {
    setBirthMonth(sanitizeDatePart(value));
    resetPersonSearchResult();
  };

  const handleBirthDayChange = (value: string) => {
    setBirthDay(sanitizeDatePart(value));
    resetPersonSearchResult();
  };

  const handleRestart = () => {
    setNoticeAccepted(false);
    setReason("visit");
    setNote("");
    setIssueType("all");
    setCareerRows([]);
    setSelectedCareerIds([]);
    if (variant === "civil") {
      setCivilLoadKey((currentKey) => currentKey + 1);
    }
    setAdditionalNote("");
    setPurpose("");
    resetPersonSearchResult();
    setSubmissionError("");
    setDownloadError("");
    setIssuedSummary(null);
    setRestoredApplicantName("");
    onRestart?.();
    moveToView(variant === "civil" ? "details" : "notice");
  };

  const handleDownload = async () => {
    if (isDownloading) {
      return;
    }

    if (!onDownload) {
      setDownloadError("다운로드 기능이 연결되지 않았습니다.");
      return;
    }

    setIsDownloading(true);
    setDownloadError("");

    try {
      await onDownload();
    } catch (error) {
      setDownloadError(getErrorMessage(error));
    } finally {
      setIsDownloading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (view) {
      case "notice":
        return (
          <NoticeStep
            accepted={noticeAccepted}
            onAcceptedChange={setNoticeAccepted}
          />
        );
      case "reason":
        return (
          <ReasonStep
            reason={reason}
            note={note}
            onReasonChange={setReason}
            onNoteChange={setNote}
          />
        );
      case "applicant":
        return (
          <ApplicantStep
            applicantName={applicantName}
            birthYear={birthYear}
            birthMonth={birthMonth}
            birthDay={birthDay}
            canSearch={canSearchPerson}
            hasSearchResult={hasPersonSearchResult}
            applicants={applicants}
            isSearching={isSearchingApplicants}
            searchError={searchError}
            selectedPerson={selectedPerson}
            onApplicantNameChange={handleApplicantNameChange}
            onBirthYearChange={handleBirthYearChange}
            onBirthMonthChange={handleBirthMonthChange}
            onBirthDayChange={handleBirthDayChange}
            onSearch={() => void handlePersonSearch()}
            onSelectedPersonChange={setSelectedPerson}
          />
        );
      case "details":
        return (
          <DetailsStep
            issueType={issueType}
            careerRows={careerRows}
            selectedCareerIds={selectedCareerIds}
            additionalNote={additionalNote}
            purpose={purpose}
            onIssueTypeChange={setIssueType}
            onCareerSelection={handleCareerSelection}
            onSelectAll={handleSelectAll}
            onAdditionalNoteChange={setAdditionalNote}
            onPurposeChange={setPurpose}
          />
        );
      default:
        return null;
    }
  };

  if (isRestoring) {
    return (
      <FlowRoot>
        <FlowLoading role="status">발급 결과를 불러오는 중입니다.</FlowLoading>
      </FlowRoot>
    );
  }

  if (view === "preview") {
    return (
      <FlowRoot key={view}>
        <CertificatePreviewView
          variant={variant}
          applicantName={selectedApplicantName}
          birthDate={
            variant === "civil"
              ? ""
              : `${birthYear}.${birthMonth.padStart(2, "0")}.${birthDay.padStart(2, "0")}`
          }
          careerRows={selectedCareerRows}
          purpose={purpose}
          additionalNote={additionalNote}
          isSubmitting={isSubmitting}
          submissionError={submissionError}
          onPrevious={() => moveToView("details")}
          onNext={() => void handlePreviewNext()}
        />
      </FlowRoot>
    );
  }

  if (view === "success") {
    return (
      <FlowRoot key={view}>
        <CertificateSuccessView
          variant={variant}
          issueType={issueType}
          applicantName={selectedApplicantName}
          documentNo={issuedSummary?.documentNo ?? ""}
          issuedAt={issuedSummary?.issuedAt ?? ""}
          isDownloading={isDownloading}
          downloadError={downloadError}
          onRestart={handleRestart}
          onDownload={() => void handleDownload()}
        />
      </FlowRoot>
    );
  }

  if (variant === "civil") {
    return (
      <FlowRoot key={view}>
        <CivilCertificateApplicationView
          issueType={issueType}
          careerRows={careerRows}
          selectedCareerIds={selectedCareerIds}
          isLoadingCareerRows={isLoadingCareerRows}
          loadError={stepError}
          canContinue={canContinue && !isLoadingCareerRows}
          purpose={purpose}
          onIssueTypeChange={setIssueType}
          onCareerSelection={handleCareerSelection}
          onSelectAll={handleSelectAll}
          onPurposeChange={setPurpose}
          onPrevious={handlePrevious}
          onNext={() => void handleNext()}
        />
      </FlowRoot>
    );
  }

  return (
    <FlowRoot key={view}>
      <CertificateWorkflowView
        currentStep={currentStep}
        canContinue={canContinue}
        nextPending={isLoadingCareerRows}
        onPrevious={handlePrevious}
        onNext={() => void handleNext()}
      >
        {renderCurrentStep()}
        {stepError && <FlowError role="alert">{stepError}</FlowError>}
      </CertificateWorkflowView>
    </FlowRoot>
  );
}

export default CareerCertificateIssue;
