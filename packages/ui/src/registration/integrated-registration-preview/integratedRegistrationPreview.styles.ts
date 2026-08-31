import styled from "@emotion/styled";
import { TextInput } from "krds-react";
import {
  ActionBar,
  ButtonGroup,
  ConfirmCard,
  ConfirmRoot,
  FieldGrid,
  FieldLabel,
  FieldRow,
  FormFlow,
  FormMainContent,
  PageHeader,
  PageTitle,
  StepCurrentText,
  StepEyebrow,
  StepHeader,
  StepTitle,
  StyledStepIndicator,
} from "../integrated-registration-confirm/integratedRegistrationConfirm.styles";

export {
  ActionBar,
  ButtonGroup,
  ConfirmCard,
  ConfirmRoot,
  FieldGrid,
  FieldLabel,
  FieldRow,
  FormFlow,
  FormMainContent,
  PageHeader,
  PageTitle,
  StepCurrentText,
  StepEyebrow,
  StepHeader,
  StepTitle,
  StyledStepIndicator,
};

export const DisabledValueInput = styled(TextInput)`
  width: 156px;
  min-width: 0;

  .krds-input {
    width: 156px;
    height: 56px;
    min-width: 0;
    padding: 0 16px;
    border-color: var(--krds-light-color-border-gray-dark, #58616a);
    border-radius: 8px;
    overflow: hidden;
    color: var(--krds-light-color-text-subtle, #464c53);
    background: var(--krds-light-color-surface-white, #fff);
    font-size: 19px;
    line-height: 1.5;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 1;
    -webkit-text-fill-color: var(--krds-light-color-text-subtle, #464c53);
  }

  .krds-input:disabled {
    cursor: not-allowed;
  }

  @media (max-width: 767px) {
    width: 100%;

    .krds-input {
      width: 100%;
    }
  }
`;

export const FormError = styled.p`
  margin: 16px 0 0;
  color: var(--krds-light-color-text-danger, #bd2c0f);
  font-size: 15px;
  line-height: 1.5;
  white-space: pre-line;
`;

// ConfirmCard 는 가로 방향 flex 중앙 정렬이라, 행 이동 UI와 필드 그리드를
// 세로로 쌓기 위한 컬럼 컨테이너를 둔다.
export const PreviewBody = styled.div`
  display: flex;
  width: min(548px, 100%);
  flex-direction: column;
  align-items: stretch;
  gap: 24px;

  @media (max-width: 767px) {
    gap: 16px;
  }
`;

export const RowNavigator = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const RowNavigatorCounter = styled.p`
  margin: 0;
  color: var(--krds-light-color-text-basic, #1e2124);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.5;
`;

export const RowNavigatorButtons = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 767px) {
    .krds-btn {
      flex: 1 1 0;
    }
  }
`;
