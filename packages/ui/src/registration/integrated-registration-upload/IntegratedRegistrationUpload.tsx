import "krds-react/dist/index.css";

import { useId, useMemo, useRef, useState } from "react";
import {
  Button,
  StepIndicator,
  type FileItem,
} from "krds-react";
import {
  ActionBar,
  ButtonGroup,
  FormError,
  FormFlow,
  FormMainContent,
  PageHeader,
  PageTitle,
  StepCurrentText,
  StepEyebrow,
  StepHeader,
  StepTitle,
  StyledFileUpload,
  StyledStepIndicator,
  UploadRoot,
} from "./integratedRegistrationUpload.styles";

export interface IntegratedRegistrationUploadStep {
  id: string;
  title: string;
}

export interface IntegratedRegistrationUploadProps {
  title?: string;
  steps?: readonly IntegratedRegistrationUploadStep[];
  currentStep?: number;
  stepLabel?: string;
  stepTitle?: string;
  uploadText?: string;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number;
  previousLabel?: string;
  nextLabel?: string;
  /** 이미 업로드를 마친 파일 이름. 새로고침/뒤로가기 시 목록을 복원할 때 쓴다. */
  initialFileName?: string;
  /** 파일이 선택될 때마다 호출된다. reject 되면 파일 상태가 error 로 표시된다. */
  onFileUpload?: (file: File) => Promise<void>;
  /** 파일 목록에서 파일이 제거될 때 호출된다. 남은 파일 목록을 함께 전달한다. */
  onFileDelete?: (fileId: string, remainingFiles: FileItem[]) => void;
  /** 업로드 실패 등 사용자에게 보여줄 오류 메시지 */
  errorMessage?: string;
  onPrevious?: () => void;
  onNext?: (files: FileItem[]) => void;
}

const defaultSteps = [
  { id: "notice", title: "유의사항 확인" },
  { id: "upload", title: "파일 업로드" },
  { id: "confirm", title: "데이터 확인" },
] as const satisfies readonly IntegratedRegistrationUploadStep[];

function IntegratedRegistrationUpload({
  title = "경력사항 통합 등록",
  steps = defaultSteps,
  currentStep = 1,
  stepLabel = "2단계 / 3단계",
  stepTitle = "엑셀 파일 업로드",
  uploadText = "첨부할 파일을 여기에 끌어다 놓거나, 파일 선택 버튼을 직접 선택해주세요.",
  acceptedFileTypes = ["xlsx", "xls", "csv"],
  maxFiles = 1,
  maxFileSize = 20 * 1024 * 1024,
  previousLabel = "이전으로",
  nextLabel = "다음으로",
  initialFileName,
  onFileUpload,
  onFileDelete,
  errorMessage,
  onPrevious,
  onNext,
}: IntegratedRegistrationUploadProps) {
  const titleId = useId();
  // 세션에 업로드가 남아 있으면(새로고침/뒤로가기) 재업로드 없이 진행할 수 있게 복원한다.
  const [files, setFiles] = useState<FileItem[]>(() =>
    initialFileName
      ? [
          {
            id: "session-restored-file",
            name: initialFileName,
            size: 0,
            type: "",
            status: "completed",
          },
        ]
      : [],
  );
  const isUploadingRef = useRef(false);

  const canProceed = useMemo(
    () =>
      files.length > 0 &&
      files.every((file) => file.status === "ready" || file.status === "completed") &&
      Boolean(onNext),
    [files, onNext],
  );

  const handleFilesChange = (nextFiles: FileItem[]) => {
    if (onFileDelete) {
      for (const file of files) {
        if (!nextFiles.some((nextFile) => nextFile.id === file.id)) {
          onFileDelete(file.id, nextFiles);
        }
      }
    }

    setFiles(nextFiles);
  };

  // krds FileUpload 는 업로드가 끝나야 목록을 커밋하므로 업로드 중에는
  // maxFiles 검사가 무력화된다. 동시 업로드를 여기서 차단해 목록 커밋이
  // 서로를 덮어쓰는 레이스를 막는다.
  const handleFileUpload = onFileUpload
    ? async (file: File) => {
        if (isUploadingRef.current) {
          throw new Error(
            "이미 파일을 업로드하는 중입니다. 완료된 뒤 다시 시도해 주세요.",
          );
        }

        isUploadingRef.current = true;

        try {
          await onFileUpload(file);
        } finally {
          isUploadingRef.current = false;
        }
      }
    : undefined;

  const handleNext = () => {
    if (!canProceed) {
      return;
    }

    onNext?.(files);
  };

  return (
    <UploadRoot aria-labelledby={titleId}>
      <PageHeader>
        <PageTitle id={titleId}>{title}</PageTitle>
        <StyledStepIndicator>
          <StepIndicator
            steps={steps.map((step, index) => ({
              id: step.id,
              step: `${index + 1}단계`,
              title: step.title,
            }))}
            currentStep={currentStep}
            currentStepText="현재 단계"
          />
        </StyledStepIndicator>
      </PageHeader>

      <FormFlow>
        <StepHeader>
          <StepEyebrow>
            <StepCurrentText>{stepLabel.split(" / ")[0]}</StepCurrentText>
            {stepLabel.includes(" / ") ? ` / ${stepLabel.split(" / ")[1]}` : ""}
          </StepEyebrow>
          <StepTitle>{stepTitle}</StepTitle>
        </StepHeader>

        <FormMainContent>
          <StyledFileUpload
            aria-label="첨부 파일 업로드"
            uploadText={uploadText}
            acceptedFileTypes={acceptedFileTypes}
            maxFiles={maxFiles}
            maxFileSize={maxFileSize}
            files={files}
            onFilesChange={handleFilesChange}
            onFileUpload={handleFileUpload}
          />
          {errorMessage && <FormError role="alert">{errorMessage}</FormError>}
        </FormMainContent>

        <ActionBar>
          <ButtonGroup>
            <Button
              variant="tertiary"
              size="xlarge"
              type="button"
              onClick={onPrevious}
            >
              {previousLabel}
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button
              variant="primary"
              size="xlarge"
              type="button"
              disabled={!canProceed}
              onClick={handleNext}
            >
              {nextLabel}
            </Button>
          </ButtonGroup>
        </ActionBar>
      </FormFlow>
    </UploadRoot>
  );
}

export default IntegratedRegistrationUpload;
