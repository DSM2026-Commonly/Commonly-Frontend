import styled from "@emotion/styled";
import { Button, TextList } from "krds-react";

export const RegistrationMethodRoot = styled.section`
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

  @media (max-width: 767px) {
    width: calc(100% - 40px);
    padding: 48px 0 72px;
    gap: 32px;
  }
`;

export const PageTitle = styled.h1`
  height: 60px;
  margin: 0;
  font-size: 40px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 1px;

  @media (max-width: 767px) {
    height: auto;
    font-size: 30px;
    line-height: 1.4;
    letter-spacing: 0;
  }
`;

export const ChoiceList = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  column-gap: 65px;
  width: 100%;
  height: 238px;

  @media (max-width: 767px) {
    display: flex;
    height: auto;
    flex-direction: column;
    gap: 32px;
  }
`;

export const ChoiceItem = styled.article`
  position: relative;
  display: flex;
  min-width: 0;
  height: 238px;
  flex-direction: column;
  justify-content: space-between;

  @media (max-width: 767px) {
    height: auto;
    gap: 32px;
  }
`;

export const ChoiceDivider = styled.span`
  position: absolute;
  top: 0;
  right: -33px;
  width: 1px;
  height: 100%;
  background: var(--krds-light-color-divider-gray-light, #cdd1d5);

  @media (max-width: 767px) {
    top: auto;
    right: 0;
    bottom: -17px;
    width: 100%;
    height: 1px;
  }
`;

export const ChoiceContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ChoiceTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.5;
`;

export const ChoiceDescription = styled.p`
  margin: 0;
  font-size: 17px;
  font-weight: 400;
  line-height: 1.5;
`;

export const ActionButton = styled(Button)`
  &.krds-btn {
    position: relative;
    display: flex;
    width: 100%;
    height: 56px;
    min-height: 56px;
    padding: 0 20px;
    border-color: var(--krds-light-color-border-gray-dark, #58616a);
    border-radius: 8px;
    justify-content: center;
    gap: 4px;
    background: transparent;
    color: var(--krds-light-color-text-basic, #1e2124);
    font-size: 19px;
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

export const ActionLabel = styled.span`
  strong {
    color: var(--krds-light-color-text-secondary, #052b57);
  }
`;

export const ArrowIcon = styled.span`
  position: absolute;
  right: 20px;
  width: 12px;
  height: 12px;
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

  @media (max-width: 767px) {
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
  color: #ffffff;
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

export const InformationListItem = styled.li``;
