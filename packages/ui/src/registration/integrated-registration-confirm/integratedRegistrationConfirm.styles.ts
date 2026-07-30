import styled from "@emotion/styled";

export const ConfirmRoot = styled.section`
  display: flex;
  width: min(792px, calc(100% - 40px));
  margin: 0 auto;
  padding: 88px 0 64px;
  box-sizing: border-box;
  flex-direction: column;
  gap: 48px;
  color: var(--krds-light-color-text-basic, #1e2124);
  font-family:
    "Pretendard GOV", Pretendard, "Noto Sans KR", "Malgun Gothic", sans-serif;

  @media (max-width: 767px) {
    width: calc(100% - 40px);
    padding: 48px 0 56px;
    gap: 36px;
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
  gap: 40px;
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
  color: var(--krds-light-color-text-strong, #131416);
  font-size: 32px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 1px;

  @media (max-width: 767px) {
    font-size: 26px;
    letter-spacing: 0;
  }
`;

export const FormMainContent = styled.div`
  display: flex;
  min-height: 436px;
  flex-direction: column;
`;

export const ConfirmCard = styled.form`
  display: flex;
  min-height: 436px;
  padding: 40px;
  box-sizing: border-box;
  border: 1px solid var(--krds-light-color-border-secondary, #b1b8be);
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  background: var(--krds-light-color-surface-white, #fff);

  @media (max-width: 767px) {
    min-height: auto;
    padding: 28px 20px;
  }
`;

export const FieldGrid = styled.div`
  display: grid;
  width: min(548px, 100%);
  grid-template-columns: repeat(2, minmax(214px, 1fr));
  column-gap: 120px;
  row-gap: 19px;

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }
`;

export const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 33px 156px;
  min-height: 56px;
  column-gap: 25px;
  align-items: center;

  @media (max-width: 767px) {
    grid-template-columns: 64px minmax(0, 1fr);
    column-gap: 16px;
  }
`;

export const FieldLabel = styled.label`
  display: block;
  color: var(--krds-light-color-text-basic, #1e2124);
  font-size: 19px;
  font-weight: 700;
  line-height: 1.5;
  white-space: pre-line;
`;

export const StyledSelect = styled.div`
  width: 156px;
  min-width: 0;

  .krds-form-select {
    width: 156px;
    height: 56px;
    min-height: 56px;
    padding: 0 44px 0 16px;
    border-color: var(--krds-light-color-border-gray-dark, #58616a);
    border-radius: 8px;
    color: var(--krds-light-color-text-subtle, #464c53);
    font-size: 19px;
    line-height: 1.5;
  }

  @media (max-width: 767px) {
    width: 100%;

    .krds-form-select {
      width: 100%;
    }
  }
`;

export const ActionBar = styled.div`
  display: flex;
  min-height: 64px;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 767px) {
    flex-direction: column-reverse;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  min-width: 114px;

  .krds-btn {
    min-width: 114px;
    height: 64px;
    min-height: 64px;
    padding: 0 24px;
    border-radius: 8px;
    font-size: 19px;
    line-height: 1.5;
  }

  .krds-btn.secondary {
    width: 120px;
    border: 1px solid var(--krds-light-color-border-gray-dark, #58616a);
    color: var(--krds-light-color-text-basic, #1e2124);
    background: var(--krds-light-color-surface-white, #fff);
  }

  .krds-btn.secondary:hover {
    background: var(--krds-light-color-action-secondary-hover, #f4f5f6);
  }

  .krds-btn.primary {
    width: 114px;
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
