import styled from "@emotion/styled";

const mobileBreakpoint = "767px";

export const UserListRoot = styled.section`
  display: flex;
  width: min(792px, calc(100% - 40px));
  margin: 0 auto;
  padding: 84px 0 64px;
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

export const UserListContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;

  @media (max-width: ${mobileBreakpoint}) {
    gap: 32px;
  }
`;

export const UserListCard = styled.section`
  display: flex;
  min-height: 743px;
  padding: 39px;
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

export const UserListTableFrame = styled.div`
  width: 100%;
  height: 539px;
  overflow-x: auto;
  overflow-y: hidden;

  .krds-table-wrap,
  .krds-table-wrap .tbl {
    width: 100%;
  }

  .krds-table-wrap .tbl {
    height: 539px;
    min-width: 712px;
    table-layout: fixed;
    border-collapse: collapse;
    color: var(--krds-light-color-text-subtle, #464c53);
    font-size: 17px;
    line-height: 1.5;
  }

  .krds-table-wrap .tbl th {
    height: 39px;
    padding: 7.75px 16px;
    box-sizing: border-box;
    border: 0;
    background: var(--krds-light-color-surface-secondary-subtler, #eef2f7);
    color: var(--krds-light-color-text-basic, #1e2124);
    font-size: 15px;
    font-weight: 700;
    line-height: 1.5;
    text-align: left;
    white-space: nowrap;
  }

  .krds-table-wrap .tbl th:first-of-type,
  .krds-table-wrap .tbl td:first-of-type {
    padding-left: 40px;
  }

  .krds-table-wrap .tbl td {
    height: 50px;
    padding: 11.75px 16px;
    box-sizing: border-box;
    border-right: 0;
    border-bottom: 1px solid var(--krds-light-color-border-gray-light, #cdd1d5);
    background: var(--krds-light-color-surface-white, #fff);
    text-align: left;
    vertical-align: middle;
    white-space: nowrap;
  }
`;
