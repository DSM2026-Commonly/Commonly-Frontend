import styled from "@emotion/styled";
import {
  MOBILE_BREAKPOINT,
  TABLET_BREAKPOINT,
} from "../CareerCertificateIssue.breakpoints";

interface CivilLayoutProps {
  $civil: boolean;
}

export const PreviewPage = styled.div<CivilLayoutProps>`
  width: min(
    ${({ $civil }) => ($civil ? "1200px" : "792px")},
    calc(100% - 48px)
  );
  margin: 88px auto 64px;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    width: calc(100% - 40px);
    margin-top: 48px;
    margin-bottom: 48px;
  }
`;

export const PreviewHeader = styled.header`
  display: flex;
  min-height: 94px;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;

  .krds-btn {
    min-width: 114px;
  }

  @media (max-width: 560px) {
    flex-direction: column;
  }
`;

export const PreviewTitle = styled.h1`
  margin: 0;
  font-size: 40px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 1px;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 30px;
  }
`;

export const FilenameBar = styled.div`
  display: flex;
  min-height: 80px;
  align-items: center;
  padding: 20px;
  overflow: hidden;
  background: #2c261f;
  color: #ffffff;
  font-family: Pretendard, "Pretendard GOV", sans-serif;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.4;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    min-height: 64px;
    font-size: 16px;
  }
`;

export const DocumentViewer = styled.div<CivilLayoutProps>`
  display: flex;
  height: ${({ $civil }) =>
    $civil ? "1492px" : "clamp(520px, 68vh, 760px)"};
  align-items: flex-start;
  justify-content: center;
  padding: ${({ $civil }) =>
    $civil ? "190px 178px 110px" : "48px 32px"};
  overflow: auto;
  background: #878079;
  overscroll-behavior: contain;

  @media (max-width: ${TABLET_BREAKPOINT}) {
    height: auto;
    padding: 40px 24px;
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    height: min(68vh, 620px);
    min-height: 420px;
    padding: 24px 16px;
  }
`;

export const DocumentSheet = styled.article<CivilLayoutProps>`
  display: flex;
  width: min(${({ $civil }) => ($civil ? "842px" : "640px")}, 100%);
  flex: 0 0 auto;
  flex-direction: column;
  gap: 32px;
  padding: 56px 48px;
  background: #ffffff;
  color: #1e1e1e;
  box-shadow: 0 2px 10px rgb(0 0 0 / 16%);
  font-family: Pretendard, "Pretendard GOV", sans-serif;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    gap: 24px;
    padding: 32px 20px;
  }
`;

export const DocumentTitle = styled.h2`
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 8px;
  text-align: center;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 24px;
    letter-spacing: 4px;
  }
`;

export const DocumentBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const DocumentTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
  line-height: 1.5;
  table-layout: fixed;

  th,
  td {
    padding: 10px 12px;
    border: 1px solid #1e1e1e;
    text-align: left;
    vertical-align: top;
    word-break: break-word;
  }

  th {
    width: 22%;
    background: #f2f2f2;
    font-weight: 600;
    text-align: center;
  }

  thead th {
    width: auto;
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 13px;

    th,
    td {
      padding: 8px;
    }
  }
`;

export const DocumentFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  font-size: 16px;
  text-align: center;

  p {
    margin: 0;
  }
`;

export const DocumentIssuer = styled.p`
  margin: 16px 0 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 6px;
  text-align: center;
`;

export const PreviewActions = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-top: 48px;

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
