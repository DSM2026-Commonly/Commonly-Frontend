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
