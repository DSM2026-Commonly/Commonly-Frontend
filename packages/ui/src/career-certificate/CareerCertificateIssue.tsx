import { useEffect, useRef, useState } from "react";
import {
  getStepIndex,
  MAX_ISSUE_CAREER_COUNT,
  STEP_VIEWS,
} from "./CareerCertificateIssue.constants";
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
  CertificatePreviewPdfState,
  IssuedCertificateSummary,
  OwnCareerLoadStatus,
} from "./CareerCertificateIssue.types";
import {
  getMissingCertificateDetailsFields,
  isCareerSelectionWithinLimit,
  isValidBirthDate,
  resolveIssuedIssueType,
  retainAvailableCareerIds,
  sanitizeApplicantName,
  sanitizeDatePart,
} from "./CareerCertificateIssue.validation";
import { getEmptyPageRetryPage } from "../pagination/pagination.utils";
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

/** API 오류의 HTTP 상태. utils 의 ApiError 에 기대지 않도록 status 필드만 본다. */
function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return undefined;
  }

  const { status } = error as { status: unknown };

  return typeof status === "number" ? status : undefined;
}

/** 처음 고를 경력. 한 번에 10건까지만 발급되므로 넘치면 앞의 10건만 고른다. */
function selectCareerIdsWithinLimit(
  rows: readonly CertificateCareerRow[],
): string[] {
  return rows.slice(0, MAX_ISSUE_CAREER_COUNT).map((row) => row.id);
}

function CareerCertificateIssue({
  initialView,
  variant = "staff",
  applicantName: fixedApplicantName = "",
  applicantBirthDate = "",
  onCancel,
  onSearchApplicants,
  onLoadCareerRows,
  onPreview,
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
  // 대상자 검색 결과는 서버가 페이지 단위로 내려준다(기본 20건).
  const [applicantsPage, setApplicantsPage] = useState(1);
  const [applicantsTotalPages, setApplicantsTotalPages] = useState(1);
  const [isSearchingApplicants, setIsSearchingApplicants] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [issueType, setIssueType] = useState<CertificateIssueType>("all");
  const [careerRows, setCareerRows] = useState<readonly CertificateCareerRow[]>(
    [],
  );
  const [isLoadingCareerRows, setIsLoadingCareerRows] = useState(false);
  // 민원인 목록이 비었을 때 "닫힘/실패/0건"을 구분해 안내하려고 조회 결과를 따로 둔다.
  // 들어오자마자 불러오므로 첫 화면에 다른 안내가 잠깐 비치지 않게 loading 으로 시작한다.
  const [ownCareerLoadStatus, setOwnCareerLoadStatus] =
    useState<OwnCareerLoadStatus>(
      variant === "civil" && onLoadCareerRows ? "loading" : "idle",
    );
  const [stepError, setStepError] = useState("");
  const [selectedCareerIds, setSelectedCareerIds] = useState<string[]>([]);
  const [additionalNote, setAdditionalNote] = useState("");
  const [purpose, setPurpose] = useState("");
  const [previewPdf, setPreviewPdf] = useState<CertificatePreviewPdfState>({
    status: "idle",
  });
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
  // 경력 로딩 중 다음 요청이 시작되면 이전 응답을 버리기 위한 요청 id.
  const careerLoadRequestIdRef = useRef(0);
  // 마지막으로 경력을 불러온 대상자. 같은 대상자를 재조회하면 선택을 보존한다.
  const careerLoadedPersonRef = useRef<string | null>(null);
  // 미리보기를 떠났다(이전으로 등) 다시 들어오면 이전 PDF 응답을 버리기 위한 요청 id.
  const previewRequestIdRef = useRef(0);
  // 경력 응답이 도착했을 때 그 사이 대상자가 바뀌었는지 보려고 최신 선택을 따로 둔다.
  // 렌더 중에 ref 를 쓰면 React Compiler 가정을 깨므로 effect 에서 맞춘다.
  const selectedPersonRef = useRef(selectedPerson);

  useEffect(() => {
    selectedPersonRef.current = selectedPerson;
  }, [selectedPerson]);

  const currentStep = getStepIndex(view);
  const canSearchPerson =
    applicantName.trim().length > 0 &&
    isValidBirthDate(birthYear, birthMonth, birthDay);
  const isSelectionWithinLimit = isCareerSelectionWithinLimit(
    issueType,
    careerRows.length,
    selectedCareerIds.length,
  );
  // 발급 용도는 증명서에 기재되는 필수 항목이다.
  const hasDetailsRequiredFields =
    getMissingCertificateDetailsFields(purpose).length === 0;
  const canContinue =
    variant === "civil"
      ? // 민원인은 본인 목록을 못 불러오면(본인 발급 비활성 등) 서버가 본인 전체로 발급하므로
        // 용도만 채우면 신청할 수 있다. 목록이 있으면 담당자와 같은 10건 제한을 따른다.
        hasDetailsRequiredFields &&
        (careerRows.length === 0 || isSelectionWithinLimit)
      : (currentStep !== 0 || noticeAccepted) &&
        (currentStep !== 2 || Boolean(selectedPerson)) &&
        (currentStep !== 3 ||
          (careerRows.length > 0 &&
            isSelectionWithinLimit &&
            hasDetailsRequiredFields));
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

  const loadOwnCareerRows = async () => {
    if (!onLoadCareerRows) {
      return;
    }

    const requestId = ++careerLoadRequestIdRef.current;

    setIsLoadingCareerRows(true);
    setOwnCareerLoadStatus("loading");

    try {
      const rows = await onLoadCareerRows("");

      if (requestId !== careerLoadRequestIdRef.current) {
        return;
      }

      setCareerRows(rows);
      setSelectedCareerIds(selectCareerIdsWithinLimit(rows));
      setOwnCareerLoadStatus("loaded");
    } catch (error) {
      if (requestId !== careerLoadRequestIdRef.current) {
        return;
      }

      // 에러를 띄우지 않고 빈 목록으로 둔다. 다만 안내 문구는 이유에 맞게 고른다.
      // 백엔드는 권한 부족에도 401 을 주므로 401·403 모두 "본인 발급 경로가 닫힘"으로 본다.
      const status = getErrorStatus(error);
      setOwnCareerLoadStatus(
        status === 401 || status === 403 ? "unavailable" : "failed",
      );
    } finally {
      if (requestId === careerLoadRequestIdRef.current) {
        setIsLoadingCareerRows(false);
      }
    }
  };

  // 민원인은 대상자 입력 단계 없이 발급 정보 화면에서 시작하므로 들어오자마자 본인 경력을 불러온다.
  useEffect(() => {
    if (variant === "civil") {
      void loadOwnCareerRows();
    }
    // onLoadCareerRows 는 페이지가 매 렌더마다 새로 만드는 콜백이라 의존성에서 제외한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveToView = (nextView: CareerCertificateIssueView) => {
    setStepError("");
    setSubmissionError("");
    setSearchError("");
    // 화면을 옮기면 받고 있던 미리보기 PDF 는 버린다. 다시 들어오면 새로 요청한다.
    previewRequestIdRef.current += 1;
    setPreviewPdf({ status: "idle" });
    setView(nextView);
  };

  // 미리보기와 발급이 같은 값을 보내도록 한 곳에서 만든다.
  const buildApplicationData = (): CareerCertificateApplicationData => ({
    issueType: resolveIssuedIssueType(issueType, careerRows.length),
    reason,
    note,
    applicantId: selectedPerson,
    applicantName,
    birthYear,
    birthMonth,
    birthDay,
    selectedCareerIds:
      issueType === "all" ? careerRows.map((row) => row.id) : selectedCareerIds,
    additionalNote,
    purpose,
  });

  const openPreview = async () => {
    moveToView("preview");

    if (!onPreview) {
      return;
    }

    const requestId = previewRequestIdRef.current;

    setPreviewPdf({ status: "loading" });

    try {
      const pdf = await onPreview(buildApplicationData());

      if (requestId !== previewRequestIdRef.current) {
        return;
      }

      setPreviewPdf({ status: "ready", pdf });
    } catch {
      if (requestId !== previewRequestIdRef.current) {
        return;
      }

      // 서버 미리보기를 못 받으면(민원인 경로가 닫혀 있는 등) 입력값으로 그린 미리보기로 대신한다.
      setPreviewPdf({ status: "failed" });
    }
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

      const requestId = ++careerLoadRequestIdRef.current;
      const requestedPerson = selectedPerson;

      try {
        const rows = await onLoadCareerRows(requestedPerson);

        // 이 사이 다음 요청이 시작됐다면 이 응답은 버린다.
        if (requestId !== careerLoadRequestIdRef.current) {
          return;
        }

        // 요청 뒤 대상자가 바뀌었다면 이전 대상자의 경력을 새 대상자에 얹지 않는다.
        // 요청 id 는 그대로라 finally 가 로딩 상태를 풀어 준다.
        if (selectedPersonRef.current !== requestedPerson) {
          return;
        }

        const isSamePerson = careerLoadedPersonRef.current === requestedPerson;
        setCareerRows(rows);
        if (isSamePerson) {
          // 같은 대상자를 재조회하면 선택은 유지하되, 새 목록에서 사라진 경력은 뺀다.
          const rowIds = rows.map((row) => row.id);
          setSelectedCareerIds((previous) =>
            retainAvailableCareerIds(previous, rowIds),
          );
        } else {
          setSelectedCareerIds(selectCareerIdsWithinLimit(rows));
        }
        careerLoadedPersonRef.current = requestedPerson;
      } catch (error) {
        if (requestId !== careerLoadRequestIdRef.current) {
          return;
        }

        setStepError(getErrorMessage(error));
        return;
      } finally {
        if (requestId === careerLoadRequestIdRef.current) {
          setIsLoadingCareerRows(false);
        }
      }

      moveToView("details");
      return;
    }

    if (currentStep < STEP_VIEWS.length - 1) {
      moveToView(STEP_VIEWS[currentStep + 1]);
      return;
    }

    void openPreview();
  };

  const handlePreviewNext = async () => {
    if (isSubmitting) {
      return;
    }

    const applicationData = buildApplicationData();

    if (!onComplete) {
      setIssueType(applicationData.issueType);
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

      // 완료 화면에는 실제로 발급한 구분을 표시한다(목록 없이 고른 선택 발급은 전체 발급이다).
      setIssueType(applicationData.issueType);
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
        return currentIds.includes(id) ||
          currentIds.length >= MAX_ISSUE_CAREER_COUNT
          ? currentIds
          : [...currentIds, id];
      }

      return currentIds.filter((currentId) => currentId !== id);
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedCareerIds(checked ? selectCareerIdsWithinLimit(careerRows) : []);
  };

  const runApplicantSearch = async (page: number) => {
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
        page,
      });

      if (requestId !== searchRequestIdRef.current) {
        return;
      }

      // 조회 사이 데이터가 줄어 빈 페이지가 오면 마지막 유효 페이지를 다시 조회한다.
      const retryPage = getEmptyPageRetryPage(
        page,
        result.items.length,
        result.totalPages,
      );

      if (retryPage !== null) {
        void runApplicantSearch(retryPage);
        return;
      }

      setApplicants(result.items);
      setApplicantsPage(page);
      setApplicantsTotalPages(Math.max(1, result.totalPages));
      setHasPersonSearchResult(true);
      // 페이지가 바뀌면 이전 선택은 목록에 없을 수 있어 단건일 때만 자동 선택한다.
      setSelectedPerson(result.items.length === 1 ? result.items[0].id : "");
    } catch (error) {
      if (requestId !== searchRequestIdRef.current) {
        return;
      }

      setApplicants([]);
      setApplicantsTotalPages(1);
      setHasPersonSearchResult(false);
      setSelectedPerson("");
      setSearchError(getErrorMessage(error));
    } finally {
      // 다음 조회(재조회 포함)가 이미 시작됐다면 그 조회가 로딩 상태를 관리한다.
      if (requestId === searchRequestIdRef.current) {
        setIsSearchingApplicants(false);
      }
    }
  };

  const handlePersonSearch = () => {
    if (!canSearchPerson || isSearchingApplicants) {
      return;
    }

    void runApplicantSearch(1);
  };

  const handleApplicantsPageChange = (nextPage: number) => {
    if (isSearchingApplicants || nextPage === applicantsPage) {
      return;
    }

    void runApplicantSearch(nextPage);
  };

  const resetPersonSearchResult = () => {
    searchRequestIdRef.current += 1;
    setHasPersonSearchResult(false);
    setSelectedPerson("");
    setApplicants([]);
    setApplicantsPage(1);
    setApplicantsTotalPages(1);
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
    setApplicantName("");
    setBirthYear("");
    setBirthMonth("");
    setBirthDay("");
    setIssueType("all");
    setCareerRows([]);
    setSelectedCareerIds([]);
    careerLoadedPersonRef.current = null;
    setAdditionalNote("");
    setPurpose("");
    resetPersonSearchResult();
    setSubmissionError("");
    setDownloadError("");
    setIssuedSummary(null);
    setRestoredApplicantName("");
    onRestart?.();
    moveToView(variant === "civil" ? "details" : "notice");

    if (variant === "civil") {
      void loadOwnCareerRows();
    }
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
            applicantsPage={applicantsPage}
            applicantsTotalPages={applicantsTotalPages}
            isSearching={isSearchingApplicants}
            isLoadingCareerRows={isLoadingCareerRows}
            searchError={searchError}
            selectedPerson={selectedPerson}
            onApplicantNameChange={handleApplicantNameChange}
            onBirthYearChange={handleBirthYearChange}
            onBirthMonthChange={handleBirthMonthChange}
            onBirthDayChange={handleBirthDayChange}
            onSearch={() => handlePersonSearch()}
            onApplicantsPageChange={handleApplicantsPageChange}
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
              ? applicantBirthDate.replace(/-/g, ".")
              : `${birthYear}.${birthMonth.padStart(2, "0")}.${birthDay.padStart(2, "0")}`
          }
          careerRows={selectedCareerRows}
          purpose={purpose}
          additionalNote={additionalNote}
          previewPdf={previewPdf}
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
          ownCareerLoadStatus={ownCareerLoadStatus}
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
