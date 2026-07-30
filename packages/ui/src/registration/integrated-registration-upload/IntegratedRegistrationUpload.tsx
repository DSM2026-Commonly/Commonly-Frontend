import "krds-react/dist/index.css";

import { useId, useMemo, useState } from "react";
import {
  Button,
  StepIndicator,
  type FileItem,
} from "krds-react";
import {
  ActionBar,
  ButtonGroup,
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
  onPrevious,
  onNext,
}: IntegratedRegistrationUploadProps) {
  const titleId = useId();
  const [files, setFiles] = useState<FileItem[]>([]);

  const canProceed = useMemo(
    () =>
      files.length > 0 &&
      files.every((file) => file.status === "ready" || file.status === "completed") &&
      Boolean(onNext),
    [files, onNext],
  );

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
            onFilesChange={setFiles}
          />
        </FormMainContent>

        <ActionBar>
          <ButtonGroup>
            <Button
              variant="secondary"
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
