import styled from "@emotion/styled";
import { Button, Link } from "krds-react";

interface FixedWidthProps {
  $width: number;
}

interface UtilityTextProps {
  $width?: number;
}

interface HeaderLayoutProps {
  $compact?: boolean;
}

export const HeaderRoot = styled.header<HeaderLayoutProps>`
  position: relative;
  z-index: 100;
  width: 100%;
  min-height: ${({ $compact }) => ($compact ? "69px" : "105px")};
  box-sizing: border-box;
  border-bottom: 1px solid #cdd1d5;
  background: #ffffff;
  color: #1e2124;
  font-family:
    "Pretendard GOV", Pretendard, "Noto Sans KR", "Malgun Gothic", sans-serif;

  @media (max-width: 767px) {
    min-height: auto;
  }
`;

export const HeaderBody = styled.div<HeaderLayoutProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ $compact }) => ($compact ? "0" : "4px")};
  width: 100%;
  padding: 12px 0 15px;
  box-sizing: border-box;

  @media (max-width: 767px) {
    gap: 12px;
    padding: 12px 16px;
  }
`;

export const UtilityRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  width: min(1200px, calc(100% - 32px));
  height: 32px;

  @media (max-width: 767px) {
    display: none;
  }
`;

export const UtilityText = styled.span<UtilityTextProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $width }) => `${$width ?? 57}px`};
  height: 23px;
  flex: 0 0 ${({ $width }) => `${$width ?? 57}px`};
  color: #1e2124;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0;
  white-space: nowrap;
`;

export const UtilityDivider = styled.span`
  width: 1px;
  height: 16px;
  flex: 0 0 1px;
  background: #cdd1d5;
`;

export const UtilityButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "$width",
})<FixedWidthProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $width }) => `${$width}px`};
  height: 24px;
  flex: 0 0 ${({ $width }) => `${$width}px`};
  padding: 0 2px;
  box-sizing: border-box;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: #1e2124;
  font: inherit;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0;
  text-decoration: underline;
  text-underline-position: from-font;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    box-shadow 150ms ease,
    transform 80ms ease;

  &:hover {
    background: #f4f5f6;
    color: #0b50d0;
  }

  &:active {
    background: #e7f0ff;
    color: #083b9a;
    box-shadow: inset 0 0 0 1px #b7ceef;
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid #246beb;
    outline-offset: 1px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  &.krds-btn {
    width: ${({ $width }) => `${$width}px`};
    min-width: 0;
    height: 24px;
    min-height: 0;
    padding: 0 2px;
    flex: 0 0 ${({ $width }) => `${$width}px`};
    color: #1e2124;
    font-size: 15px;
    font-weight: 400;
    line-height: 1.5;
    white-space: nowrap;
  }
`;

export const MainRow = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
  width: min(1200px, calc(100% - 32px));
  height: 41.148px;

  @media (max-width: 767px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    height: auto;
  }
`;

export const BrandLink = styled(Link, {
  shouldForwardProp: (prop) => prop !== "$width",
})<FixedWidthProps>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: ${({ $width }) => `${$width}px`};
  height: 41.148px;
  flex: 0 0 ${({ $width }) => `${$width}px`};
  color: inherit;
  text-decoration: none;

  &:focus-visible {
    border-radius: 4px;
    outline: 2px solid #246beb;
    outline-offset: 2px;
  }

  &.krds-btn.link {
    display: flex;
    width: ${({ $width }) => `${$width}px`};
    min-width: 0;
    height: 41.148px !important;
    min-height: 0;
    padding: 0 !important;
    border: 0;
    aspect-ratio: auto;
    flex: 0 0 ${({ $width }) => `${$width}px`};
    flex-wrap: nowrap;
    gap: 10px;
    color: inherit;
    text-decoration: none;
  }

  &.krds-btn.link > span {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 767px) {
    flex-basis: 41.148px;

    &.krds-btn.link {
      flex-basis: 41.148px;
    }
  }
`;

export const BrandLogo = styled.img`
  display: block;
  width: 120.204px;
  height: 41.148px;
  flex: 0 0 120.204px;
  object-fit: cover;
`;

export const BrandTitle = styled.span<FixedWidthProps>`
  display: inline-flex;
  align-items: center;
  width: ${({ $width }) => `${$width}px`};
  height: 29px;
  color: #595656;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0;
  white-space: nowrap;
`;

export const PrimaryNavigation = styled.nav`
  min-width: 0;
  flex: 1 1 auto;

  @media (max-width: 767px) {
    width: 100%;
    overflow-x: auto;
  }
`;

export const PrimaryNavigationList = styled.ul`
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 8px;
  height: 40px;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (max-width: 767px) {
    width: max-content;
    justify-content: flex-start;
  }
`;

export const PrimaryNavigationLink = styled(Link, {
  shouldForwardProp: (prop) => prop !== "$width",
})<FixedWidthProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ $width }) => `${$width}px`};
  height: 40px;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 6px;
  background: transparent;
  color: #1e2124;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    background: #f4f5f6;
  }

  &:focus-visible {
    outline: 2px solid #246beb;
    outline-offset: -2px;
  }

  &.krds-btn.link {
    display: flex;
    width: ${({ $width }) => `${$width}px`};
    min-width: 0;
    height: 40px !important;
    min-height: 0;
    padding: 0 12px !important;
    aspect-ratio: auto;
    color: #1e2124;
    font-size: 17px;
    font-weight: 700;
    line-height: 1.5;
    text-decoration: none;
    white-space: nowrap;
  }
`;
