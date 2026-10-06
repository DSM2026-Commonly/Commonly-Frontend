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

  /* 이력이 적을 때 행이 표 높이만큼 늘어나지 않게 데이터 행은 내용 높이로 두고,
     빈 목록·오류 안내만 표 영역 가운데에 둔다. */
  .krds-table-wrap .tbl:has(td[colspan]) {
    height: 539px;
  }

  /* 상세 내용은 문서번호·대상자·용도·발급 사유가 이어져 길어지므로 칸 안에서 줄바꿈한다. */
  .krds-table-wrap .tbl td.work-history-details {
    white-space: normal;
    word-break: keep-all;
    overflow-wrap: anywhere;
  }
`;

export const TableStatus = styled.p<{ $tone?: "error" | "muted" }>`
  margin: 0;
  padding: 24px 16px;
  color: ${({ $tone }) =>
    $tone === "error"
      ? "var(--krds-light-color-text-danger, #de3412)"
      : "var(--krds-light-color-text-subtle, #464c53)"};
  font-size: 17px;
  line-height: 1.5;
  text-align: center;
  white-space: normal;
`;

export const FilterForm = styled.form`
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const FilterField = styled.div<{ $grow?: boolean }>`
  min-width: 0;
  flex: ${({ $grow }) => ($grow ? "1 1 200px" : "0 1 190px")};

  /* krds TextInput 과 동일한 마크업(.form-group)을 사용하므로 날짜 입력도 같은 높이를 가진다. */
  input[type="date"] {
    width: 100%;
    box-sizing: border-box;
  }

  @media (max-width: 767px) {
    flex: none;
  }
`;

export const FilterActions = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 767px) {
    > * {
      flex: 1;
    }
  }
`;

export const FilterError = styled.p`
  width: 100%;
  margin: 0;
  color: var(--krds-light-color-text-danger, #de3412);
  font-size: 15px;
  line-height: 1.5;
`;
