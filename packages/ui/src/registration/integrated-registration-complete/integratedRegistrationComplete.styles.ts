import styled from "@emotion/styled";
import { Button } from "krds-react";

export const CompleteRoot = styled.section`
  display: flex;
  width: min(792px, calc(100% - 40px));
  margin: 0 auto;
  padding: 118px 0 58px;
  box-sizing: border-box;
  flex-direction: column;
  gap: 50px;
  color: var(--krds-light-color-text-basic, #1e2124);
  font-family:
    "Pretendard GOV", Pretendard, "Noto Sans KR", "Malgun Gothic", sans-serif;

  @media (max-width: 767px) {
    width: calc(100% - 40px);
    padding: 48px 0 56px;
    gap: 36px;
  }
`;

export const CompleteTitle = styled.h1`
  margin: 0;
  padding-top: 0;
  color: var(--krds-light-color-text-strong, #131416);
  font-size: 40px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 1px;
  text-align: center;

  strong {
    color: var(--krds-light-color-text-primary, #256ef4);
  }

  @media (max-width: 767px) {
    padding-top: 0;
    font-size: 30px;
    line-height: 1.4;
    letter-spacing: 0;
  }
`;

export const DetailSection = styled.div`
  display: flex;
  min-height: 319px;
  flex-direction: column;
  gap: 38px;
`;

export const ResultCard = styled.dl`
  display: flex;
  min-height: 215px;
  margin: 0;
  padding: 40px;
  box-sizing: border-box;
  border-radius: 8px;
  flex-direction: column;
  gap: 24px;
  background: var(--krds-light-color-surface-secondary-subtler, #eef2f7);

  @media (max-width: 767px) {
    min-height: auto;
    padding: 28px 20px;
  }
`;

export const ResultRow = styled.div`
  display: grid;
  grid-template-columns: 173px minmax(0, 1fr);
  gap: 13px;
  align-items: center;

  @media (max-width: 767px) {
    grid-template-columns: 112px minmax(0, 1fr);
  }
`;

export const ResultLabel = styled.dt`
  margin: 0;
  color: var(--krds-light-color-text-basic, #1e2124);
  font-size: 19px;
  font-weight: 700;
  line-height: 1.5;
`;

export const ResultValue = styled.dd`
  margin: 0;
  color: var(--krds-light-color-text-subtle, #464c53);
  font-size: 19px;
  font-weight: 400;
  line-height: 1.5;
`;

export const ActionGroup = styled.div`
  display: flex;
  min-height: 64px;
  justify-content: center;
  gap: 16px;

  @media (max-width: 767px) {
    flex-direction: column;
  }
`;

export const ActionButton = styled(Button)`
  &.krds-btn {
    position: relative;
    display: inline-flex;
    height: 64px;
    min-height: 64px;
    padding: 0 24px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    font-size: 19px;
    font-weight: 400;
    line-height: 1.5;
  }

  &.krds-btn:first-of-type {
    width: 139px;
    border: 1px solid var(--krds-light-color-border-gray-dark, #58616a);
    color: var(--krds-light-color-text-basic, #1e2124);
    background: var(--krds-light-color-surface-white, #fff);
  }

  &.krds-btn:first-of-type:hover {
    background: var(--krds-light-color-action-secondary-hover, #f4f5f6);
  }

  &.krds-btn:last-of-type {
    width: 154px;
    border: 1px solid var(--krds-light-color-button-primary-fill, #256ef4);
    color: var(--krds-light-color-text-basic-inverse, #fff);
    background: var(--krds-light-color-button-primary-fill, #256ef4);
  }

  @media (max-width: 767px) {
    &.krds-btn,
    &.krds-btn:first-of-type,
    &.krds-btn:last-of-type {
      width: 100%;
    }
  }
`;
