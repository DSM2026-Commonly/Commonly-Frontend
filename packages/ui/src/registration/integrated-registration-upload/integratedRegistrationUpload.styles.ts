import styled from "@emotion/styled";
import { FileUpload } from "krds-react";

export const UploadRoot = styled.section`
  display: flex;
  width: min(792px, calc(100% - 40px));
  margin: 0 auto;
  padding: 88px 0 49px;
  box-sizing: border-box;
  flex-direction: column;
  gap: 48px;
  color: var(--krds-light-color-text-basic, #1e2124);
  font-family:
    "Pretendard GOV", Pretendard, "Noto Sans KR", "Malgun Gothic", sans-serif;

  @media (max-width: 767px) {
    width: calc(100% - 40px);
    padding: 48px 0 56px;
    gap: 32px;
  }
`;

export const PageHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 24px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const PageTitle = styled.h1`
  margin: 0;
  font-size: 40px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 1px;

  @media (max-width: 767px) {
    font-size: 30px;
    line-height: 1.4;
    letter-spacing: 0;
  }
`;

export const StyledStepIndicator = styled.div`
  min-width: 0;
  overflow: visible;

  .krds-step-wrap {
    width: 360px;
    max-width: 100%;
    min-width: 0;
    margin-bottom: 0;
  }

  .krds-step-wrap > li {
    min-width: 0;
  }

  .krds-step-wrap .step-tit,
  .krds-step-wrap .step {
    white-space: nowrap;
  }
`;

export const FormFlow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const StepHeader = styled.div`
  min-height: 0;
`;

export const StepEyebrow = styled.p`
  margin: 0 0 8px;
  color: var(--krds-light-color-text-subtle, #464c53);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.5;
`;

export const StepCurrentText = styled.span`
  color: var(--krds-light-color-text-primary, #256ef4);
`;

export const StepTitle = styled.h2`
  margin: 0;
  font-size: 25px;
  font-weight: 700;
  line-height: 1.4;

  @media (max-width: 767px) {
    font-size: 26px;
  }
`;

export const FormMainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export const StyledFileUpload = styled(FileUpload)`
  &.krds-file-upload.line {
    padding: 0;
    border: 0;
    border-radius: 0;
    gap: 24px;
  }

  .file-upload {
    min-height: 181px;
    padding: 40px 24px;
    border-radius: 8px;
    gap: 18px;
  }

  .file-upload .txt {
    font-size: 15px;
    line-height: 1.5;
  }

  .file-upload-btn-wrap .krds-btn {
    min-width: 73px;
    min-height: 40px;
    padding: 0 14px;
    border-radius: 5px;
  }

  .file-list {
    gap: 8px;
  }

  .file-list .total {
    display: none;
  }

  .file-list .upload-list {
    gap: 8px;
  }

  .file-list .upload-list > li {
    min-height: 40px;
    padding: 8px 12px 8px 20px;
    border-radius: 5px;
    background: var(--krds-light-color-surface-white, #fff);
  }
`;

export const ActionBar = styled.div`
  display: flex;
  min-height: 68px;
  margin-top: 40px;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 767px) {
    flex-direction: column-reverse;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  min-width: 120px;

  .krds-btn {
    width: 120px;
    min-width: 120px;
    height: 68px;
    min-height: 68px;
    padding: 0 24px;
    border-radius: 8px;
    font-size: 19px;
    line-height: 1.5;
  }

  .krds-btn.secondary {
    border: 1px solid var(--krds-light-color-border-gray-dark, #58616a);
    color: var(--krds-light-color-text-basic, #1e2124);
    background: var(--krds-light-color-surface-white, #fff);
  }

  .krds-btn.secondary:hover {
    background: var(--krds-light-color-action-secondary-hover, #f4f5f6);
  }

  .krds-btn.primary {
    border: 1px solid var(--krds-light-color-button-primary-fill, #256ef4);
    color: var(--krds-light-color-text-basic-inverse, #fff);
    background: var(--krds-light-color-button-primary-fill, #256ef4);
  }

  .krds-btn.primary:disabled,
  .krds-btn.primary[disabled] {
    border-color: var(--krds-light-color-border-disabled, #cdd1d5);
    color: var(--krds-light-color-text-disabled, #8a949e);
    background: var(--krds-light-color-surface-disabled, #e6e8ea);
    cursor: not-allowed;
  }

  @media (max-width: 767px) {
    width: 100%;

    .krds-btn {
      width: 100%;
    }
  }
`;
