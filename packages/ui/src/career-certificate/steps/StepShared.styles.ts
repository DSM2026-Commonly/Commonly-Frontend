import styled from "@emotion/styled";
import { MOBILE_BREAKPOINT } from "../CareerCertificateIssue.breakpoints";

export const FormCard = styled.div`
  padding: 40px;
  border: 1px solid var(--career-color-border);
  border-radius: 12px;
  background: #ffffff;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    padding: 28px 24px;
  }
`;

export const CardStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const CardTitle = styled.h3`
  margin: 0;
  color: var(--career-color-text);
  font-size: 24px;
  font-weight: 700;
  line-height: 1.5;
`;

export const CardSubheading = styled.h4`
  margin: 0;
  color: var(--career-color-text);
  font-size: 19px;
  font-weight: 700;
  line-height: 1.5;
`;

export const Fieldset = styled.fieldset`
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
`;

export const RadioSection = styled.div`
  margin-top: 24px;

  .krds-check-area.chk-column {
    gap: 16px;
  }
`;

export const TableFrame = styled.div`
  width: 100%;
  margin-top: 16px;

  .krds-table-wrap {
    width: 100%;
  }

  .krds-table-wrap .tbl {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    color: var(--career-color-text-subtle);
    font-size: 15px;
    line-height: 1.5;
  }

  .krds-table-wrap .tbl th {
    height: 39px;
    padding: 8px 12px;
    border: 0;
    background: var(--career-color-surface);
    color: var(--career-color-text);
    font-weight: 700;
    text-align: left;
  }

  .krds-table-wrap .tbl td {
    min-height: 50px;
    padding: 12px;
    border-right: 0;
    border-bottom: 1px solid var(--career-color-border);
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

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    overflow-x: auto;

    .krds-table-wrap {
      min-width: 680px;
    }
  }
`;
