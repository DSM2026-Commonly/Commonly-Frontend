import { useState } from "react";
import certificatePreview from "../assets/career-certificate-preview.png";
import {
  CAREER_ROWS,
  getStepIndex,
  STEP_VIEWS,
} from "./CareerCertificateIssue.constants";
import { FlowRoot } from "./CareerCertificateIssue.styles";
import type {
  CareerCertificateIssueProps,
  CareerCertificateIssueView,
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
  CertificateIssueType,
} from "./CareerCertificateIssue.types";

function CareerCertificateIssue({
  initialView,
  variant = "staff",
  onCancel,
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
  const [issueType, setIssueType] = useState<CertificateIssueType>("all");
  const [selectedCareerIds, setSelectedCareerIds] = useState<string[]>(
    CAREER_ROWS.map((row) => row.id),
  );
  const [additionalNote, setAdditionalNote] = useState("");
  const [purpose, setPurpose] = useState("");

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

  useCareerCertificateScroll(view);

  const moveToView = (nextView: CareerCertificateIssueView) => {
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

  const handleNext = () => {
    if (!canContinue) {
      return;
    }

    if (currentStep < STEP_VIEWS.length - 1) {
      moveToView(STEP_VIEWS[currentStep + 1]);
      return;
    }

    moveToView("preview");
  };

  const handlePreviewNext = () => {
    onComplete?.({
      issueType,
      reason,
      note,
      applicantName,
      birthYear,
      birthMonth,
      birthDay,
      selectedCareerIds,
      additionalNote,
      purpose,
    });
    moveToView("success");
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
    setSelectedCareerIds(checked ? CAREER_ROWS.map((row) => row.id) : []);
  };

  const handlePersonSearch = () => {
    if (!canSearchPerson) {
      return;
    }

    setHasPersonSearchResult(true);
    setSelectedPerson("jeon-jaejun");
  };

  const resetPersonSearchResult = () => {
    setHasPersonSearchResult(false);
    setSelectedPerson("");
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
    setSelectedCareerIds(CAREER_ROWS.map((row) => row.id));
    setAdditionalNote("");
    setPurpose("");
    moveToView(variant === "civil" ? "details" : "notice");
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }

    const link = document.createElement("a");
    link.href = certificatePreview;
    link.download = "유성구청_전재준_경력증명서_A2026-001.png";
    link.click();
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
            selectedPerson={selectedPerson}
            onApplicantNameChange={handleApplicantNameChange}
            onBirthYearChange={handleBirthYearChange}
            onBirthMonthChange={handleBirthMonthChange}
            onBirthDayChange={handleBirthDayChange}
            onSearch={handlePersonSearch}
            onSelectedPersonChange={setSelectedPerson}
          />
        );
      case "details":
        return (
          <DetailsStep
            issueType={issueType}
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
          onPrevious={() => moveToView("details")}
          onNext={handlePreviewNext}
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
          onRestart={handleRestart}
          onDownload={handleDownload}
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
          onNext={handleNext}
        />
      </FlowRoot>
    );
  }

  return (
    <FlowRoot key={view}>
      <CertificateWorkflowView
        currentStep={currentStep}
        canContinue={canContinue}
        onPrevious={handlePrevious}
        onNext={handleNext}
      >
        {renderCurrentStep()}
      </CertificateWorkflowView>
    </FlowRoot>
  );
}

export default CareerCertificateIssue;
