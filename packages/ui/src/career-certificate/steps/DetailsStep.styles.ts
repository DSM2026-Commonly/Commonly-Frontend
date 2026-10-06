import styled from "@emotion/styled";
import { requiredLabelStyles } from "../../form/requiredFields.styles";

export {
  CardStack,
  CardSubheading,
  CardTitle,
  Fieldset,
  FormCard,
  RadioSection,
  TableFrame,
} from "./StepShared.styles";

export const SelectionIntro = styled.div`
  margin-top: 24px;
`;

export const SelectionToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
`;

export const SelectionCount = styled.p`
  margin: 0;
  color: var(--career-color-text-subtle);
  font-size: 15px;
  line-height: 1.5;

  strong {
    color: #0b50d0;
    font-weight: 700;
  }
`;

export const SelectionLimitNotice = styled.p`
  margin: 8px 0 0;
  color: var(--career-color-text-subtle);
  font-size: 15px;
  line-height: 1.5;
`;

export const SelectAllButton = styled.button`
  min-height: 24px;
  padding: 0 2px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--career-color-text);
  font-size: 15px;
  line-height: 1.5;
  text-decoration: underline;
  text-underline-position: from-font;
  cursor: pointer;

  &:hover {
    background: #f4f5f6;
    color: #0b50d0;
  }

  &:focus-visible {
    outline: 2px solid var(--career-color-primary);
    outline-offset: 2px;
  }
`;

export const ExtraFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;

  ${requiredLabelStyles}

  .form-group,
  .form-conts,
  .krds-input {
    width: 100%;
  }
`;

/** 날짜처럼 중간에서 끊기면 읽기 어려운 값을 한 덩어리로 둔다. */
export const NoWrap = styled.span`
  white-space: nowrap;
`;
