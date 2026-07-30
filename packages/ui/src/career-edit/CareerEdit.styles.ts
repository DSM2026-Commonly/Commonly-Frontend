import styled from "@emotion/styled";

const MOBILE_BREAKPOINT = "767px";

export const CareerEditRoot = styled.section`
  --career-edit-text: var(--krds-light-color-text-basic, #1e2124);
  --career-edit-text-subtle: var(--krds-light-color-text-subtle, #464c53);
  --career-edit-primary: var(--krds-light-color-text-primary, #256ef4);
  --career-edit-border: var(--krds-light-color-divider-gray-light, #cdd1d5);
  --career-edit-surface: var(
    --krds-light-color-surface-secondary-subtler,
    #eef2f7
  );
  --career-edit-surface-primary: var(
    --krds-light-color-surface-primary-subtler,
    #ecf2fe
  );
  --career-color-text: var(--career-edit-text);
  --career-color-text-subtle: var(--career-edit-text-subtle);
  --career-color-border: var(--career-edit-border);
  --career-color-surface: var(--career-edit-surface);
  --career-color-surface-primary: var(--career-edit-surface-primary);

  width: 100%;
  animation: career-edit-view-enter 280ms
    cubic-bezier(0.22, 1, 0.36, 1);
  color: var(--career-edit-text);
  font-family:
    "Pretendard GOV", Pretendard, "Noto Sans KR", "Malgun Gothic", sans-serif;

  &,
  & * {
    box-sizing: border-box;
  }

  @keyframes career-edit-view-enter {
    from {
      opacity: 0;
      transform: translateY(10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

export const WorkflowPage = styled.div`
  width: min(792px, calc(100% - 48px));
  margin: 0 auto;
  padding: 88px 0 96px;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    width: calc(100% - 40px);
    padding: 48px 0 64px;
  }
`;

export const PageHeader = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 288px) minmax(0, 480px);
  gap: 24px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const PageTitle = styled.h1`
  margin: 0;
  color: var(--career-edit-text);
  font-size: 40px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 1px;
  outline: none;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 30px;
    line-height: 1.4;
    letter-spacing: 0;
  }
`;

export const StepIndicatorFrame = styled.div`
  width: 480px;
  max-width: 100%;
  overflow: hidden;

  .krds-step-wrap {
    width: 480px;
    min-width: 480px;
    margin: 0;
  }

  .krds-step-wrap > li {
    min-width: 96px;
  }

  .krds-step-wrap .step,
  .krds-step-wrap .step-tit {
    white-space: nowrap;
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 4px;
  }
`;

export const Stage = styled.div`
  margin-top: 48px;
`;

export const StageHeader = styled.header`
  min-height: 82px;
`;

export const StageEyebrow = styled.p`
  margin: 0;
  color: var(--career-edit-text-subtle);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.5;
`;

export const CurrentStepText = styled.strong`
  color: var(--career-edit-primary);
`;

export const StageTitle = styled.h2`
  margin: 8px 0 0;
  color: var(--career-edit-text);
  font-size: 32px;
  font-weight: 700;
  line-height: 1.5;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 26px;
  }
`;

export const StageContent = styled.div`
  display: flex;
  margin-top: 40px;
  flex-direction: column;
  gap: 24px;
`;

export const FormFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  .form-group,
  .form-conts,
  .textarea-wrap,
  .krds-input {
    width: 100%;
  }

  textarea.krds-input {
    min-height: 132px;
    resize: vertical;
  }
`;

export const PersonalIdentityRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 160px;
  gap: 16px;
  align-items: end;

  .form-group,
  .form-conts,
  .krds-input {
    width: 100%;
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const GenderField = styled.div`
  min-width: 0;

  .krds-check-area {
    display: flex;
    min-height: 48px;
    align-items: center;
    gap: 16px;
  }
`;

export const AddressFields = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;

  .form-group,
  .form-conts,
  .krds-input {
    width: 100%;
  }

  .krds-btn {
    min-width: 88px;
    min-height: 48px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;

    .krds-btn {
      width: 100%;
    }
  }
`;

export const ActionRow = styled.div`
  display: flex;
  min-height: 68px;
  margin-top: 40px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  .krds-btn {
    min-width: 120px;
    min-height: 56px;
  }

  @media (max-width: 479px) {
    .krds-btn {
      min-width: 0;
      flex: 1 1 0;
    }
  }
`;

export const EmptyState = styled.p`
  margin: 0;
  padding: 20px;
  border-radius: 8px;
  background: var(--career-edit-surface);
  color: var(--career-edit-text-subtle);
  font-size: 16px;
  line-height: 1.6;
`;

export const SuccessPage = styled.div`
  display: flex;
  width: min(792px, calc(100% - 48px));
  min-height: 560px;
  margin: 0 auto;
  padding: 112px 0 96px;
  flex-direction: column;
  align-items: center;
  text-align: center;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    width: calc(100% - 40px);
    min-height: 480px;
    padding: 72px 0 64px;
  }
`;

export const SuccessTitle = styled.h1`
  margin: 0;
  color: var(--career-edit-text);
  font-size: 40px;
  font-weight: 700;
  line-height: 1.5;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 30px;
  }
`;

export const SuccessMessage = styled.p`
  margin: 16px 0 0;
  color: var(--career-edit-text);
  font-size: 32px;
  font-weight: 700;
  line-height: 1.5;

  strong {
    color: var(--career-edit-primary);
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 24px;
  }
`;

export const SummaryCard = styled.dl`
  display: grid;
  width: 100%;
  margin: 48px 0 0;
  padding: 24px 32px;
  border-radius: 12px;
  grid-template-columns: 140px minmax(0, 1fr);
  row-gap: 16px;
  background: var(--career-edit-surface);
  text-align: left;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    grid-template-columns: 1fr;
    row-gap: 8px;
  }
`;

export const SummaryTerm = styled.dt`
  margin: 0;
  color: var(--career-edit-text-subtle);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.5;
`;

export const SummaryValue = styled.dd`
  margin: 0;
  color: var(--career-edit-text);
  font-size: 17px;
  line-height: 1.5;
`;

export const SuccessActions = styled.div`
  display: flex;
  margin-top: 32px;
  gap: 12px;

  .krds-btn {
    min-width: 152px;
  }

  @media (max-width: 520px) {
    width: 100%;
    flex-direction: column-reverse;

    .krds-btn {
      width: 100%;
    }
  }
`;
