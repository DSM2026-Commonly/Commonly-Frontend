import styled from "@emotion/styled";
import { MOBILE_BREAKPOINT } from "../CareerCertificateIssue.breakpoints";

export const CivilApplicationPage = styled.div`
  width: min(792px, calc(100% - 48px));
  margin: 169px auto 64px;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    width: calc(100% - 40px);
    margin-top: 48px;
    margin-bottom: 48px;
  }
`;

export const CivilPageTitle = styled.h1`
  margin: 0 0 48px;
  color: var(--career-color-text);
  font-size: 40px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 1px;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    margin-bottom: 32px;
    font-size: 30px;
  }
`;

export const GuideCard = styled.section`
  margin-bottom: 24px;
  padding: 40px;
  border: 1px solid #d6e0eb;
  border-radius: 12px;
  background: var(--career-color-surface);

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    padding: 28px 24px;
  }
`;

export const GuideHeader = styled.div`
  p {
    margin: 24px 0 0;
    color: var(--career-color-text);
    font-size: 19px;
    line-height: 1.5;
  }
`;

export const GuideTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  color: #131416;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.5;
`;

export const GuideIcon = styled.span`
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  flex: 0 0 32px;
  color: #256ef4;

  svg {
    width: 32px;
    height: 32px;
    fill: currentColor;
  }

  path:last-of-type {
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2.4;
  }
`;

export const GuideDivider = styled.hr`
  margin: 24px 0;
  border: 0;
  border-top: 1px dashed #b1b8be;
`;

export const GuideBody = styled.div`
  color: var(--career-color-text);
  font-size: 17px;
  line-height: 1.5;

  p {
    margin: 0;
  }
`;

export const GuideList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0 0;
  padding-left: 24px;
  color: var(--career-color-text-subtle);
`;

export const CivilActionRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-top: 40px;

  .krds-btn {
    min-width: 114px;
  }

  @media (max-width: 479px) {
    .krds-btn {
      min-width: 0;
      flex: 1 1 0;
    }
  }
`;
