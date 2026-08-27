import styled from "@emotion/styled";

export const SearchForm = styled.form`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 96px;
  gap: 12px;
  align-items: end;

  @media (max-width: 480px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const SearchGuide = styled.p`
  margin: 12px 0 0;
  color: #6b6b6b;
  font-size: 14px;
  line-height: 1.5;
`;

export const SearchStatus = styled.p`
  margin: 16px 0 0;
  font-size: 15px;
  line-height: 1.5;

  &[role="alert"] {
    color: #c4302b;
  }
`;

export const EmptyMessage = styled.p`
  margin: 16px 0 0;
  padding: 32px 16px;
  border: 1px dashed #c6c6c6;
  border-radius: 8px;
  color: #6b6b6b;
  font-size: 15px;
  text-align: center;
`;

export const AddressList = styled.ul`
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid #d8d8d8;
  max-height: 360px;
  overflow-y: auto;
`;

export const AddressListItem = styled.li`
  border-bottom: 1px solid #e6e6e6;

  button {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 4px;
    padding: 12px 8px;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      background: #f3f6fa;
      outline: none;
    }
  }
`;

export const AddressPrimary = styled.span`
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  word-break: keep-all;
`;

export const AddressSecondary = styled.span`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  color: #555555;
  font-size: 14px;
  line-height: 1.5;
`;

export const AddressMeta = styled.span`
  span {
    display: inline-block;
    margin-right: 6px;
    padding: 0 6px;
    border-radius: 4px;
    background: #e9edf2;
    color: #3d4b5c;
    font-size: 12px;
    line-height: 20px;
  }
`;

export const PagerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  font-size: 15px;
`;
