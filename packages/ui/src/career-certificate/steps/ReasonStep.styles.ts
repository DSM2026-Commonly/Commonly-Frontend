import styled from "@emotion/styled";

export {
  CardSubheading,
  Fieldset,
  FormCard,
  RadioSection,
} from "./StepShared.styles";

export const TextareaFrame = styled.div`
  margin-top: 40px;

  .form-group,
  .form-conts,
  .textarea-wrap {
    width: 100%;
  }

  textarea.krds-input {
    height: 132px;
    min-height: 132px;
    resize: none;
  }
`;
