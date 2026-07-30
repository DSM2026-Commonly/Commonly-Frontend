import styled from "@emotion/styled";
import { TextList } from "krds-react";

interface IndividualLayoutProps {
  $individual: boolean;
}

export const RegistrationNoticeRoot = styled.section<IndividualLayoutProps>`
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

  @media (max-width: 767px) {
    width: calc(100% - 40px);
    padding: 48px 0 56px;
    gap: 36px;
  }
`;

export const PageHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 24px;
  align-items: start;
  padding: 0;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const PageTitle = styled.h1`
  margin: 0;
  font-size: 40px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 1px;

  @media (max-width: 767px) {
    font-size: 30px;
    line-height: 1.4;
    letter-spacing: 0;
  }
`;

export const StyledStepIndicator = styled.div`
  min-width: 0;
  overflow: visible;

  .krds-step-wrap {
    width: 360px;
    max-width: 100%;
    min-width: 0;
    margin-bottom: 0;
  }

  .krds-step-wrap > li {
    min-width: 0;
  }

  .krds-step-wrap .step-tit,
  .krds-step-wrap .step {
    white-space: nowrap;
  }
`;

export const FormFlow = styled.div<IndividualLayoutProps>`
  display: flex;
  flex-direction: column;
  gap: ${({ $individual }) => ($individual ? "40px" : "32px")};
`;

export const StepHeader = styled.div`
  min-height: 0;
`;

export const StepEyebrow = styled.p`
  margin: 0 0 8px;
  color: var(--krds-light-color-text-subtle, #464c53);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.5;
`;

export const StepCurrentText = styled.span`
  color: var(--krds-light-color-text-primary, #256ef4);
`;

export const StepTitle = styled.h2`
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.5;

  @media (max-width: 767px) {
    font-size: 26px;
  }
`;

export const FormMainContent = styled.div`
  display: flex;
  min-height: 551px;
  flex-direction: column;
  gap: 64px;
`;

export const GuideCard = styled.aside`
  display: flex;
  min-height: 198px;
  padding: 40px;
  box-sizing: border-box;
  border: 1px solid var(--krds-light-color-border-secondary-light, #d6e0eb);
  border-radius: 12px;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
  background: var(--krds-light-color-surface-secondary-subtler, #eef2f7);

  @media (max-width: 767px) {
    min-height: auto;
    padding: 28px 24px;
  }
`;

export const GuideTitle = styled.h3`
  display: flex;
  margin: 0;
  align-items: center;
  gap: 8px;
  color: var(--krds-light-color-text-basic, #1e2124);
  font-size: 24px;
  font-weight: 700;
  line-height: 1.5;
`;

export const GuideIcon = styled.img`
  display: block;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
`;

export const GuideBody = styled.p`
  margin: 0;
  white-space: pre-line;
  color: var(--krds-light-color-text-basic, #1e2124);
  font-size: 19px;
  font-weight: 400;
  line-height: 1.5;
`;

export const NoticeHeading = styled.h3`
  margin: 0 0 20px;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.5;
`;

export const StyledTextList = styled(TextList)`
  min-height: 102px;
  margin: 0;
  --krds-info-list--gap-layout-depth1-li-li: 12px;
  color: var(--krds-light-color-text-subtle, #464c53);
  font-size: 17px;
  line-height: 1.5;
`;

export const AgreementBand = styled.div`
  display: flex;
  min-height: 74px;
  padding: 24px;
  box-sizing: border-box;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  background: var(--krds-light-color-surface-primary-subtler, #ecf2fe);

  .krds-form-check {
    min-width: 320px;
    justify-content: center;
  }
`;

export const ActionBar = styled.div<IndividualLayoutProps>`
  display: flex;
  min-height: ${({ $individual }) => ($individual ? "64px" : "68px")};
  margin-top: 0px;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 767px) {
    flex-direction: column-reverse;
  }
`;

export const ButtonGroup = styled.div<IndividualLayoutProps>`
  display: flex;
  min-width: ${({ $individual }) => ($individual ? "114px" : "120px")};

  .krds-btn {
    width: ${({ $individual }) => ($individual ? "114px" : "120px")};
    min-width: ${({ $individual }) => ($individual ? "114px" : "120px")};
    height: ${({ $individual }) => ($individual ? "64px" : "68px")};
    min-height: ${({ $individual }) => ($individual ? "64px" : "68px")};
    padding: 0 24px;
    border-radius: 8px;
    font-size: 19px;
    line-height: 1.5;
  }

  .krds-btn.secondary,
  .krds-btn.tertiary {
    border: 1px solid var(--krds-light-color-border-gray-dark, #58616a);
    color: var(--krds-light-color-text-basic, #1e2124);
    background: var(--krds-light-color-surface-white, #fff);
  }

  .krds-btn.secondary:hover,
  .krds-btn.tertiary:hover {
    background: var(--krds-light-color-action-secondary-hover, #f4f5f6);
  }

  .krds-btn.primary {
    border: 1px solid var(--krds-light-color-button-primary-fill, #256ef4);
    color: var(--krds-light-color-text-basic-inverse, #fff);
    background: var(--krds-light-color-button-primary-fill, #256ef4);
  }

  .krds-btn.primary:disabled,
  .krds-btn.primary[disabled] {
    border-color: var(--krds-light-color-border-disabled, #cdd1d5);
    color: var(--krds-light-color-text-disabled, #8a949e);
    background: var(--krds-light-color-surface-disabled, #e6e8ea);
    cursor: not-allowed;
  }

  @media (max-width: 767px) {
    width: 100%;

    .krds-btn {
      width: 100%;
    }
  }
`;
