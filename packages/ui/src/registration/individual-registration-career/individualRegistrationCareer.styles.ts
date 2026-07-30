import styled from "@emotion/styled";

export const CareerForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

export const CareerCard = styled.section`
  overflow: hidden;
  border: 1px solid var(--krds-light-color-border-gray-light, #b1b8be);
  border-radius: 12px;
  background: var(--krds-light-color-surface-white, #fff);

  @media (max-width: 767px) {
    border-radius: 12px;
  }
`;

export const CareerCardTitle = styled.h3`
  margin: 0;
  padding: 24px 40px;
  color: var(--krds-light-color-text-strong, #131416);
  font-size: 24px;
  font-weight: 700;
  line-height: 1.5;

  @media (max-width: 767px) {
    padding: 20px;
    font-size: 21px;
  }
`;

export const CareerCardBody = styled.div`
  padding: 0 40px 40px;

  @media (max-width: 767px) {
    padding: 0 20px 28px;
  }
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  .form-group,
  .form-conts,
  .krds-input,
  .krds-form-select,
  .textarea-wrap,
  textarea {
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

  > div > label {
    display: block;
    margin-bottom: 8px;
    color: var(--krds-light-color-text-subtle, #464c53);
    font-size: 15px;
    line-height: 1.5;
  }

  textarea {
    min-height: 144px;
    overflow-y: hidden;
    border-radius: 8px;
    resize: none;
  }
`;

export const DateFields = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
