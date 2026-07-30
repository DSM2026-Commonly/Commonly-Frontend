import styled from "@emotion/styled";
import { MOBILE_BREAKPOINT } from "../CareerCertificateIssue.breakpoints";

export const StandardPage = styled.div`
  width: min(792px, calc(100% - 48px));
  margin: 88px auto 64px;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    width: calc(100% - 40px);
    margin-top: 48px;
    margin-bottom: 48px;
  }
`;

export const TitleRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 288px) 480px;
  gap: 24px;
  align-items: start;
  min-height: 73px;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

export const PageTitle = styled.h1`
  margin: 0;
  color: var(--career-color-text);
  font-size: 40px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 1px;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 32px;
    line-height: 1.35;
  }
`;

export const StepIndicatorFrame = styled.div`
  width: 480px;
  overflow: hidden;

  .krds-step-wrap {
    width: 480px;
    margin: 0;
  }

  .krds-step-wrap > li {
    min-width: 120px;
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 4px;
  }
`;

export const Stage = styled.div`
  margin-top: 48px;
`;

export const StageHeader = styled.header`
  min-height: 82px;
`;

export const StageEyebrow = styled.p`
  margin: 0;
  color: var(--career-color-text-subtle);
  font-size: 17px;
  line-height: 1.5;

  strong {
    color: #0b50d0;
    font-weight: 700;
  }
`;

export const StageTitle = styled.h2`
  margin: 8px 0 0;
  color: var(--career-color-text);
  font-size: 32px;
  font-weight: 700;
  line-height: 1.5;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 28px;
  }
`;

export const StageContent = styled.div`
  margin-top: 40px;
`;

export const ActionRow = styled.div`
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
