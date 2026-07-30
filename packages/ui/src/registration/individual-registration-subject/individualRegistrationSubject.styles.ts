import styled from "@emotion/styled";

export const IndividualRegistrationSubjectRoot = styled.section`
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

  @media (max-width: 767px) {
    font-size: 26px;
  }
`;

export const FormMainContent = styled.div`
  display: flex;
  min-height: 531px;
  flex-direction: column;
  gap: 40px;
`;

export const FormCard = styled.form`
  display: flex;
  min-height: 531px;
  padding: 40px;
  box-sizing: border-box;
  border: 1px solid var(--krds-light-color-border-gray-light, #b1b8be);
  border-radius: 12px;
  flex-direction: column;
  gap: 24px;
  background: var(--krds-light-color-surface-white, #fff);

  .form-group,
  .form-conts,
  .krds-input,
  .krds-form-select {
    width: 100%;
  }

  .krds-input,
  .krds-form-select {
    min-height: 56px;
    border-radius: 8px;
  }

  .krds-form-select.completed {
    color: var(--krds-light-color-text-basic, #1e2124);
  }

  @media (max-width: 767px) {
    min-height: auto;
    padding: 28px 20px;
  }
`;

export const FormSectionTitle = styled.h3`
  margin: 0;
  color: var(--krds-light-color-text-strong, #131416);
  font-size: 24px;
  font-weight: 700;
  line-height: 1.5;
`;

export const NameAndGenderFields = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 527px) 157px;
  gap: 28px;
  align-items: end;

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const RadioFieldset = styled.fieldset`
  min-width: 0;
  margin: 0;
  padding: 0 0 12px;
  border: 0;

  legend {
    margin-bottom: 16px;
    padding: 0;
    color: var(--krds-light-color-text-subtle, #464c53);
    font-size: 15px;
    line-height: 1.5;
  }

  .krds-check-area {
    display: flex;
    gap: 16px;
  }
`;

export const FieldLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  color: var(--krds-light-color-text-subtle, #464c53);
  font-size: 15px;
  line-height: 1.5;
`;

export const BirthDateFields = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const AddressFields = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 606px) 90px;
  gap: 16px;
  align-items: end;

  .krds-input:disabled {
    color: var(--krds-light-color-text-disabled, #8a949e);
    background: var(--krds-light-color-surface-disabled, #e6e8ea);
    opacity: 1;
    -webkit-text-fill-color: var(--krds-light-color-text-disabled, #8a949e);
  }

  .krds-btn {
    width: 90px;
    min-width: 90px;
    height: 56px;
  }

  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr);

    .krds-btn {
      width: 100%;
    }
  }
`;

export const DuplicateCheckArea = styled.div`
  display: flex;
  min-height: 56px;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;

  .krds-btn {
    min-width: 112px;
    height: 56px;
  }

  @media (max-width: 560px) {
    align-items: stretch;
    flex-direction: column-reverse;

    .krds-btn {
      width: 100%;
    }
  }
`;

export const DuplicateResultCard = styled.section`
  display: flex;
  min-height: 279px;
  padding: 40px;
  box-sizing: border-box;
  border: 1px solid var(--krds-light-color-border-gray-light, #b1b8be);
  border-radius: 12px;
  flex-direction: column;
  gap: 24px;
  background: var(--krds-light-color-surface-white, #fff);

  @media (max-width: 767px) {
    min-height: auto;
    padding: 28px 20px;
  }
`;

export const DuplicateResultTitle = styled.h3`
  margin: 0;
  color: var(--krds-light-color-text-strong, #131416);
  font-size: 24px;
  font-weight: 700;
  line-height: 1.5;
`;

export const DuplicateTableFrame = styled.div`
  width: 100%;

  .krds-table-wrap,
  .krds-table-wrap .tbl {
    width: 100%;
  }

  .krds-table-wrap .tbl {
    table-layout: fixed;
    border-collapse: collapse;
    color: var(--krds-light-color-text-subtle, #464c53);
    font-size: 15px;
    line-height: 1.5;
  }

  .krds-table-wrap .tbl th {
    height: 39px;
    padding: 8px 12px;
    border: 0;
    background: var(--krds-light-color-surface-secondary-subtler, #eef2f7);
    color: var(--krds-light-color-text-basic, #1e2124);
    font-weight: 700;
    text-align: left;
  }

  .krds-table-wrap .tbl td {
    height: 50px;
    padding: 12px;
    border-right: 0;
    border-bottom: 1px solid var(--krds-light-color-border-gray-light, #cdd1d5);
    text-align: left;
    vertical-align: middle;
  }

  .krds-table-wrap .tbl th:first-of-type,
  .krds-table-wrap .tbl td:first-of-type {
    text-align: center;
  }

  .krds-form-check {
    display: inline-flex;
    width: 24px;
    min-height: 24px;
    margin: 0;
    vertical-align: middle;
  }

  @media (max-width: 767px) {
    overflow-x: auto;

    .krds-table-wrap {
      min-width: 712px;
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

  .krds-btn.tertiary {
    border: 1px solid var(--krds-light-color-border-gray-dark, #58616a);
    color: var(--krds-light-color-text-basic, #1e2124);
    background: var(--krds-light-color-surface-white, #fff);
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

export const DuplicateActionGroup = styled.div`
  display: flex;
  gap: 16px;

  .krds-btn {
    height: 64px;
    min-height: 64px;
    padding: 0 24px;
    border-radius: 8px;
    font-size: 19px;
    line-height: 1.5;
  }

  @media (max-width: 767px) {
    width: 100%;
    flex-direction: column;

    .krds-btn {
      width: 100%;
    }
  }
`;
