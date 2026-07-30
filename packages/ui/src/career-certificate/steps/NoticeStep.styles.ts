import styled from "@emotion/styled";
import { MOBILE_BREAKPOINT } from "../CareerCertificateIssue.breakpoints";

export const IntroCard = styled.div`
  min-height: 198px;
  padding: 40px;
  border: 1px solid #d6e0eb;
  border-radius: 12px;
  background: var(--career-color-surface);

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    min-height: auto;
    padding: 28px 24px;
  }
`;

export const IntroHeading = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.5;
`;

export const GuideIcon = styled.img`
  display: block;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
`;

export const IntroDescription = styled.p`
  margin: 24px 0 0;
  color: var(--career-color-text-subtle);
  font-size: 17px;
  line-height: 1.5;
  white-space: pre-line;
`;

export const NoticeSection = styled.div`
  margin-top: 64px;
`;

export const NoticeHeading = styled.h3`
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.5;
`;

export const NoticeListFrame = styled.div`
  margin-top: 16px;

  .krds-info-list {
    margin: 0;
    color: var(--career-color-text-subtle);
    font-size: 17px;
    line-height: 1.5;
  }
`;

export const WarningText = styled.p`
  margin: 16px 0 0;
  color: #131416;
  font-size: 17px;
  line-height: 1.5;
`;

export const ConfirmPanel = styled.div`
  display: flex;
  min-height: 74px;
  align-items: center;
  justify-content: center;
  margin-top: 64px;
  padding: 24px;
  border-radius: 12px;
  background: var(--career-color-surface-primary);

  .krds-form-check {
    margin: 0;
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    justify-content: flex-start;
  }
`;
