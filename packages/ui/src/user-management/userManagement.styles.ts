import styled from "@emotion/styled";
import { Button, TextList } from "krds-react";

const mobileBreakpoint = "767px";

export const LandingRoot = styled.section`
  display: flex;
  width: min(792px, calc(100% - 40px));
  margin: 0 auto;
  padding: 88px 0 137px;
  box-sizing: border-box;
  flex-direction: column;
  gap: 48px;
  color: var(--krds-light-color-text-basic, #1e2124);
  font-family:
    "Pretendard GOV", Pretendard, "Noto Sans KR", "Malgun Gothic", sans-serif;

  @media (max-width: ${mobileBreakpoint}) {
    width: calc(100% - 40px);
    padding: 48px 0 72px;
    gap: 32px;
  }
`;

export const PageTitle = styled.h1`
  margin: 0;
  color: var(--krds-light-color-text-strong, #131416);
  font-size: 40px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 1px;

  @media (max-width: ${mobileBreakpoint}) {
    font-size: 30px;
    line-height: 1.4;
    letter-spacing: 0;
  }
`;

export const ManagementActionList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
  width: 100%;

  @media (max-width: ${mobileBreakpoint}) {
    grid-template-columns: minmax(0, 1fr);
    gap: 33px;
  }
`;

export const ManagementActionItem = styled.article`
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 196px;
  flex-direction: column;
  justify-content: space-between;
  gap: 32px;

  &:not(:last-of-type)::after {
    position: absolute;
    top: 0;
    right: -16px;
    width: 1px;
    height: 100%;
    background: var(--krds-light-color-divider-gray-light, #cdd1d5);
    content: "";
  }

  @media (max-width: ${mobileBreakpoint}) {
    min-height: auto;

    &:not(:last-of-type)::after {
      top: auto;
      right: 0;
      bottom: -17px;
      width: 100%;
      height: 1px;
    }
  }
`;

export const ManagementActionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ManagementActionTitle = styled.h2`
  margin: 0;
  color: var(--krds-light-color-text-strong, #131416);
  font-size: 24px;
  font-weight: 700;
  line-height: 1.5;
`;

export const ManagementActionDescription = styled.p`
  margin: 0;
  color: var(--krds-light-color-text-subtle, #464c53);
  font-size: 17px;
  line-height: 1.5;
`;

export const ShortcutButton = styled(Button)`
  &.krds-btn {
    position: relative;
    display: flex;
    width: 100%;
    height: 56px;
    min-height: 56px;
    padding: 0 40px 0 20px;
    border: 1px solid var(--krds-light-color-border-gray-dark, #58616a);
    border-radius: 8px;
    justify-content: center;
    background: var(--krds-light-color-surface-white, #fff);
    color: var(--krds-light-color-text-basic, #1e2124);
    font-size: 17px;
    font-weight: 400;
    line-height: 1.5;
  }

  &.krds-btn:hover {
    background: var(--krds-light-color-action-secondary-hover, #f4f5f6);
  }

  &.krds-btn:focus-visible {
    outline: 2px solid var(--krds-light-color-border-primary, #256ef4);
    outline-offset: 2px;
  }
`;

export const ShortcutLabel = styled.span`
  strong {
    color: var(--krds-light-color-text-secondary, #052b57);
  }
`;

export const ArrowIcon = styled.span`
  position: absolute;
  right: 20px;
  width: 10px;
  height: 10px;
  border-top: 1.5px solid currentColor;
  border-right: 1.5px solid currentColor;
  transform: rotate(45deg);
`;

export const InformationBox = styled.aside`
  display: flex;
  min-height: 130px;
  padding: 16px 24px;
  box-sizing: border-box;
  border: 1px solid var(--krds-light-color-border-secondary-light, #d6e0eb);
  border-radius: 12px;
  flex-direction: column;
  gap: 12px;
  background: var(--krds-light-color-surface-secondary-subtler, #eef2f7);

  @media (max-width: ${mobileBreakpoint}) {
    padding: 16px 20px;
  }
`;

export const InformationHeader = styled.div`
  display: flex;
  min-height: 26px;
  align-items: center;
  gap: 8px;
`;

export const InformationIcon = styled.span`
  display: inline-flex;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  flex: 0 0 20px;
  background: var(--krds-light-color-icon-secondary, #052b57);
  color: #fff;
  font-family: Arial, sans-serif;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
`;

export const InformationTitle = styled.h2`
  margin: 0;
  color: var(--krds-light-color-text-secondary, #052b57);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.5;
`;

export const InformationList = styled(TextList)`
  display: flex;
  width: calc(100% - 28px);
  margin: 0 0 0 28px;
  padding: 0;
  flex-direction: column;
  gap: 8px;
  color: var(--krds-light-color-text-subtle, #464c53);
  font-size: 17px;
  line-height: 1.5;
`;

export const WorkflowRoot = styled.section`
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

  @media (max-width: ${mobileBreakpoint}) {
    width: calc(100% - 40px);
    padding: 48px 0 56px;
    gap: 36px;
  }
`;

export const FormCard = styled.form`
  display: flex;
  padding: 40px;
  box-sizing: border-box;
  border: 1px solid var(--krds-light-color-border-gray-light, #b1b8be);
  border-radius: 12px;
  flex-direction: column;
  gap: 24px;
  background: var(--krds-light-color-surface-white, #fff);

  .form-group,
  .form-conts,
  .krds-input {
    width: 100%;
  }

  .krds-input {
    min-height: 56px;
    border-radius: 8px;
  }

  @media (max-width: ${mobileBreakpoint}) {
    padding: 28px 20px;
  }
`;

export const FormSectionTitle = styled.h2`
  margin: 0;
  color: var(--krds-light-color-text-strong, #131416);
  font-size: 24px;
  font-weight: 700;
  line-height: 1.5;
`;

export const FieldStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const PageActionRow = styled.div`
  display: flex;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: ${mobileBreakpoint}) {
    align-items: stretch;
    flex-direction: column-reverse;
  }
`;

export const PageActionButton = styled(Button)`
  &.krds-btn {
    display: inline-flex;
    min-width: 114px;
    height: 64px;
    min-height: 64px;
    padding: 0 24px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    font-size: 19px;
    line-height: 1.5;
  }

  &.krds-btn.tertiary,
  &.krds-btn.secondary {
    border: 1px solid var(--krds-light-color-border-gray-dark, #58616a);
    color: var(--krds-light-color-text-basic, #1e2124);
    background: var(--krds-light-color-surface-white, #fff);
  }

  &.krds-btn.tertiary:hover,
  &.krds-btn.secondary:hover {
    background: var(--krds-light-color-action-secondary-hover, #f4f5f6);
  }

  @media (max-width: ${mobileBreakpoint}) {
    &.krds-btn {
      width: 100%;
    }
  }
`;

export const SubmissionError = styled.p`
  margin: 0;
  color: var(--krds-light-color-text-danger, #d50136);
  font-size: 15px;
  line-height: 1.5;
`;

export const SearchCard = styled(FormCard)`
  min-height: 303px;
`;

export const SearchButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;

  .krds-btn {
    min-width: 128px;
    height: 56px;
    min-height: 56px;
    border-radius: 8px;
    font-size: 17px;
  }

  @media (max-width: ${mobileBreakpoint}) {
    .krds-btn {
      width: 100%;
    }
  }
`;

export const ResultCard = styled.section`
  display: flex;
  min-height: 227px;
  padding: 40px;
  box-sizing: border-box;
  border: 1px solid var(--krds-light-color-border-gray-light, #b1b8be);
  border-radius: 12px;
  flex-direction: column;
  gap: 24px;
  background: var(--krds-light-color-surface-white, #fff);

  @media (max-width: ${mobileBreakpoint}) {
    min-height: auto;
    padding: 28px 20px;
  }
`;

export const SearchStatus = styled.p`
  margin: 0;
  color: var(--krds-light-color-text-subtle, #464c53);
  font-size: 17px;
  line-height: 1.5;
`;

export const TableFrame = styled.div`
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
    min-height: 50px;
    padding: 12px;
    border-right: 0;
    border-bottom: 1px solid var(--krds-light-color-border-gray-light, #cdd1d5);
    text-align: left;
    vertical-align: middle;
    word-break: keep-all;
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

  @media (max-width: ${mobileBreakpoint}) {
    overflow-x: auto;

    .krds-table-wrap {
      min-width: 680px;
    }
  }
`;

export const SuccessRoot = styled.section`
  display: flex;
  width: min(792px, calc(100% - 40px));
  min-height: 456px;
  margin: 0 auto;
  padding: 118px 0 64px;
  box-sizing: border-box;
  align-items: center;
  flex-direction: column;
  gap: 96px;
  color: var(--krds-light-color-text-basic, #1e2124);
  font-family:
    "Pretendard GOV", Pretendard, "Noto Sans KR", "Malgun Gothic", sans-serif;

  @media (max-width: ${mobileBreakpoint}) {
    width: calc(100% - 40px);
    min-height: auto;
    padding: 64px 0 72px;
    gap: 56px;
  }
`;

export const SuccessTitle = styled.h1`
  margin: 0;
  color: var(--krds-light-color-text-strong, #131416);
  font-size: 40px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 1px;
  text-align: center;

  strong {
    color: var(--krds-light-color-text-primary, #256ef4);
  }

  @media (max-width: ${mobileBreakpoint}) {
    font-size: 30px;
    line-height: 1.4;
    letter-spacing: 0;
  }
`;

export const SuccessActions = styled.div`
  display: flex;
  min-height: 64px;
  justify-content: center;
  gap: 16px;

  @media (max-width: ${mobileBreakpoint}) {
    width: 100%;
    flex-direction: column;

    .krds-btn {
      width: 100%;
    }
  }
`;
