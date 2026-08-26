import { useRef, useState } from "react";
import certificatePreview from "../assets/career-certificate-preview.png";
import {
  CAREER_ROWS,
  DEMO_APPLICANTS,
  getStepIndex,
  STEP_VIEWS,
} from "./CareerCertificateIssue.constants";
import { FlowError, FlowRoot } from "./CareerCertificateIssue.styles";
import type {
  CareerCertificateApplicationData,
  CareerCertificateIssueProps,
  CareerCertificateIssueView,
  CertificateApplicant,
  CertificateCareerRow,
  CertificateIssueType,
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
  onCancel,
  onSearchApplicants,
  onLoadCareerRows,
  onComplete,
  onDownload,
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
    CAREER_ROWS,
  );
  const [isLoadingCareerRows, setIsLoadingCareerRows] = useState(false);
  const [stepError, setStepError] = useState("");
  const [selectedCareerIds, setSelectedCareerIds] = useState<string[]>(
    CAREER_ROWS.map((row) => row.id),
  );
  const [additionalNote, setAdditionalNote] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  // 검색 중 입력이 바뀌어 리셋된 뒤 도착하는 이전 응답을 무시하기 위한 요청 id.
  const searchRequestIdRef = useRef(0);

  const currentStep = getStepIndex(view);
  const canSearchPerson =
    applicantName.trim().length > 0 &&
    isValidBirthDate(birthYear, birthMonth, birthDay);
  const canContinue =
    (currentStep !== 0 || noticeAccepted) &&
    (currentStep !== 2 || Boolean(selectedPerson)) &&
    (currentStep !== 3 ||
      issueType === "all" ||
      selectedCareerIds.length > 0);
  const selectedApplicantName = applicants.find(
    (applicant) => applicant.id === selectedPerson,
  )?.name;

  useCareerCertificateScroll(view);

  const moveToView = (nextView: CareerCertificateIssueView) => {
    setStepError("");
    setView(nextView);
  };

  const handlePrevious = () => {
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
      await onComplete(applicationData);
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
      setApplicants(DEMO_APPLICANTS);
      setHasPersonSearchResult(true);
      setSelectedPerson(DEMO_APPLICANTS[0].id);
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
    setIssueType("all");
    setCareerRows(onLoadCareerRows ? [] : CAREER_ROWS);
    setSelectedCareerIds(
      onLoadCareerRows ? [] : CAREER_ROWS.map((row) => row.id),
    );
    setAdditionalNote("");
    setPurpose("");
    resetPersonSearchResult();
    setSubmissionError("");
    setDownloadError("");
    moveToView(variant === "civil" ? "details" : "notice");
  };

  const handleDownload = async () => {
    if (isDownloading) {
      return;
    }

    if (!onDownload) {
      const link = document.createElement("a");
      link.href = certificatePreview;
      link.download = "유성구청_전재준_경력증명서_A2026-001.png";
      link.click();
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

  if (view === "preview") {
    return (
      <FlowRoot key={view}>
        <CertificatePreviewView
          variant={variant}
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
          selectedCareerIds={selectedCareerIds}
          canContinue={canContinue}
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
