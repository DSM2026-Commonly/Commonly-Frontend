import styled from "@emotion/styled";
import { MOBILE_BREAKPOINT } from "../CareerCertificateIssue.breakpoints";

export const SuccessPage = styled.div`
  width: min(792px, calc(100% - 48px));
  margin: 88px auto 64px;
  padding-top: 40px;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    width: calc(100% - 40px);
    margin-top: 48px;
    padding-top: 16px;
  }
`;

export const SuccessTitle = styled.h1`
  margin: 0;
  color: var(--career-color-text);
  font-size: 40px;
  font-weight: 700;
  line-height: 1.5;
  text-align: center;

  strong {
    color: #0b50d0;
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 30px;
  }
`;

export const SummaryCard = styled.dl`
  display: grid;
  grid-template-columns: 191px minmax(0, 1fr);
  gap: 24px 12px;
  margin-top: 48px;
  padding: 40px;
  border-radius: 12px;
  background: var(--career-color-surface);
  font-size: 17px;
  line-height: 1.5;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 28px 24px;
  }
`;

export const SummaryLabel = styled.dt`
  margin: 0;
  font-weight: 700;
`;

export const SummaryValue = styled.dd`
  margin: 0;
  color: var(--career-color-text-subtle);

  p {
    margin: 0;
  }

  p + p {
    margin-top: 16px;
  }
`;

export const SuccessActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;

  @media (max-width: 560px) {
    align-items: stretch;
    flex-direction: column;
  }
`;
