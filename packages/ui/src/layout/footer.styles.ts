import styled from "@emotion/styled";
import { Footer } from "krds-react";

export const StyledFooter = styled(Footer)`
  &#krds-footer {
    width: 100%;
    min-height: 327px;
    box-sizing: border-box;
    color: #1e2124;
    background-color: #f4f5f6;
    font-family: "Pretendard GOV", Pretendard, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;

    & > .inner {
      display: flex;
      flex-direction: column;
      gap: 40px;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 0 24px;
      box-sizing: border-box;
    }

    .f-logo {
      position: relative;
      display: flex;
      align-items: center;
      width: 251px;
      height: 41px;
      background: none;
    }

    .f-logo img {
      width: 120px !important;
      height: 41px !important;
      object-fit: contain !important;
    }

    .f-logo::after {
      margin-left: 10px;
      color: #595656;
      content: "경력관리 시스템";
      font-size: 19px;
      font-weight: 700;
      line-height: 1.5;
      white-space: nowrap;
    }

    .f-cnt {
      display: grid;
      grid-template-columns: minmax(0, 894px) 282px;
      gap: 24px;
      min-height: 102px;
    }

    .f-cnt .f-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
      color: #1e2124;
      font-size: 17px;
      line-height: 1.5;
    }

    .f-cnt .f-info .info-addr {
      margin: 0;
    }

    .f-cnt .f-info .info-cs {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 0;
    }

    .f-cnt .f-info .info-cs li {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      min-height: 26px;
    }

    .f-cnt .f-info .info-cs li .strong {
      flex: 0 0 67px;
      font-weight: 700;
    }

    .f-cnt .f-info .info-cs li .span {
      font-weight: 400;
      white-space: pre-wrap;
    }

    .f-cnt .f-link {
      display: flex;
      width: 282px;
      padding-top: 34px;
    }

    .f-cnt .f-link .link-go {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    .f-cnt .f-link .link-go .krds-btn.text {
      gap: 4px;
      width: auto;
      height: 32px;
      min-height: 32px;
      padding: 0 2px;
      color: #1e2124;
      font-size: 17px;
      font-weight: 400;
      line-height: 1.5;
    }

    .f-cnt .f-link .link-go .svg-icon {
      width: 20px;
      height: 20px;
    }

    .f-btm {
      display: flex;
      justify-content: flex-end;
      min-height: 40px;
      padding-top: 16px;
      border-top: 1px solid #cdd1d5;
      box-sizing: border-box;
    }

    .f-btm .f-btm-text {
      display: block;
      flex: none;
      width: auto;
      margin-left: auto;
    }

    .f-btm .f-btm-text .f-copy {
      margin: 0;
      color: #464c53;
      font-size: 15px;
      line-height: 1.5;
    }

    @media (max-width: 1239px) {
      & > .inner {
        padding-right: 24px;
        padding-left: 24px;
      }
    }

    @media (max-width: 767px) {
      min-height: auto;

      & > .inner {
        gap: 32px;
        padding: 32px 20px 24px;
      }

      .f-cnt {
        grid-template-columns: 1fr;
        gap: 28px;
      }

      .f-cnt .f-info {
        gap: 16px;
        font-size: 16px;
      }

      .f-cnt .f-info .info-cs li {
        flex-direction: row;
      }

      .f-cnt .f-link {
        width: 100%;
        padding-top: 0;
      }

      .f-btm {
        justify-content: flex-start;
      }

      .f-btm .f-btm-text {
        margin-left: 0;
      }
    }

    @media (max-width: 479px) {
      .f-logo {
        max-width: 100%;
      }

      .f-cnt .f-info .info-cs li {
        align-items: flex-start;
      }

      .f-cnt .f-info .info-cs li .span {
        min-width: 0;
      }
    }
  }
`;
