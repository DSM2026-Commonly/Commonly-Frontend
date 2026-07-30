import styled from "@emotion/styled";

export {
  CardStack,
  CardTitle,
  FormCard,
  TableFrame,
} from "./StepShared.styles";

export const FieldGroup = styled.div`
  margin-top: 24px;
`;

export const FieldLabel = styled.p`
  margin: 0 0 8px;
  color: var(--career-color-text);
  font-size: 15px;
  line-height: 1.5;
`;

export const DateFields = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  .form-group,
  .form-conts,
  .krds-input,
  .krds-form-select {
    width: 100%;
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const SearchAction = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
`;
