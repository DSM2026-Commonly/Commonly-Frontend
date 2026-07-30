import styled from "@emotion/styled";

export const WorkHistoryRoot = styled.section`
  display: flex;
  width: min(980px, calc(100% - 40px));
  min-height: 883px;
  margin: 0 auto;
  padding: 84px 0 64px;
  box-sizing: border-box;
  flex-direction: column;
  gap: 48px;
  color: var(--krds-light-color-text-basic, #1e2124);
  font-family:
    "Pretendard GOV", Pretendard, "Noto Sans KR", "Malgun Gothic", sans-serif;

  @media (max-width: 767px) {
    width: calc(100% - 40px);
    min-height: auto;
    padding: 48px 0 56px;
    gap: 36px;
  }
`;

export const PageTitle = styled.h1`
  min-height: 60px;
  margin: 0;
  color: var(--krds-light-color-text-bolder, #131416);
  font-size: 40px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 1px;

  @media (max-width: 767px) {
    min-height: auto;
    font-size: 30px;
    line-height: 1.4;
    letter-spacing: 0;
  }
`;

export const TableFrame = styled.div`
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
    min-width: 780px;
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

export const PaginationFrame = styled.div`
  display: flex;
  width: min(516px, 100%);
  min-height: 40px;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
`;

export const PaginationNav = styled.nav`
  display: flex;
  width: 100%;
  height: 40px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--krds-light-color-text-subtle, #464c53);
  font-size: 17px;
  line-height: 1.5;
`;

export const PageNumberList = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const PageNumberButton = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  color: ${({ $active }) => ($active ? "#fff" : "inherit")};
  background: ${({ $active }) => ($active ? "#063a74" : "transparent")};
  font: inherit;
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
  cursor: pointer;

  &:hover {
    background: ${({ $active }) => ($active ? "#063a74" : "#eef2f7")};
  }

  &:focus-visible {
    outline: 2px solid var(--krds-light-color-border-primary, #256ef4);
    outline-offset: 2px;
  }
`;

export const PageEllipsis = styled.span`
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  letter-spacing: 2px;
`;

export const PageMoveButton = styled.button<{ $direction: "prev" | "next" }>`
  display: inline-flex;
  width: 62px;
  height: 40px;
  padding: ${({ $direction }) =>
    $direction === "prev" ? "0 8px 0 0" : "0 0 0 8px"};
  border: 0;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  color: inherit;
  background: transparent;
  font: inherit;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #eef2f7;
  }

  &:focus-visible {
    outline: 2px solid var(--krds-light-color-border-primary, #256ef4);
    outline-offset: 2px;
  }

  &:disabled {
    color: var(--krds-light-color-text-disabled, #8a949e);
    cursor: default;
  }
`;

export const PageMoveIcon = styled.span<{ $direction: "prev" | "next" }>`
  width: 9px;
  height: 9px;
  border-bottom: 1.5px solid currentColor;
  border-left: 1.5px solid currentColor;
  transform: rotate(${({ $direction }) =>
    $direction === "prev" ? "45deg" : "225deg"});
`;
