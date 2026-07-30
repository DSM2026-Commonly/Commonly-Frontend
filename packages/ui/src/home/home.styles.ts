import styled from "@emotion/styled";
import { Link } from "krds-react";

export const HomeRoot = styled.div`
  width: 100%;
  padding: 40px 0 96px;
  box-sizing: border-box;
  color: var(--krds-light-color-text-basic, #1e2124);
  font-family:
    "Pretendard GOV", Pretendard, "Noto Sans KR", "Malgun Gothic", sans-serif;

  @media (max-width: 767px) {
    padding: 24px 0 64px;
  }
`;

export const HomeInner = styled.div`
  width: min(1200px, calc(100% - 48px));
  margin: 0 auto;

  @media (max-width: 767px) {
    width: calc(100% - 40px);
  }
`;

export const HeroSection = styled.section`
  display: flex;
  min-height: 464px;
  align-items: center;
  padding: 72px 100px;
  box-sizing: border-box;
  border-radius: 12px;
  background: var(--krds-light-color-surface-secondary-subtler, #eef2f7);

  @media (max-width: 1023px) {
    min-height: 400px;
    padding: 64px 72px;
  }

  @media (max-width: 767px) {
    min-height: 320px;
    padding: 48px 32px;
    border-radius: 8px;
  }

  @media (max-width: 479px) {
    min-height: 288px;
    padding: 40px 24px;
  }
`;

export const HeroContent = styled.div`
  max-width: 640px;
`;

export const HeroTitle = styled.h1`
  margin: 0;
  color: var(--krds-light-color-text-bolder, #131416);
  font-size: 40px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0;

  @media (max-width: 767px) {
    font-size: 32px;
  }

  @media (max-width: 479px) {
    font-size: 28px;
  }
`;

export const HeroDescription = styled.p`
  margin: 24px 0 0;
  color: var(--krds-light-color-text-subtle, #464c53);
  font-size: 19px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0;

  @media (max-width: 767px) {
    font-size: 17px;
  }
`;

export const ServicesSection = styled.section`
  margin-top: 72px;

  @media (max-width: 767px) {
    margin-top: 56px;
  }
`;

export const ServicesTitle = styled.h2`
  margin: 0;
  color: var(--krds-light-color-text-bolder, #131416);
  font-size: 32px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0;

  @media (max-width: 767px) {
    font-size: 26px;
  }
`;

export const ServiceList = styled.ul`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  margin: 24px 0 0;
  padding: 0;
  list-style: none;

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const ServiceCard = styled.li`
  display: flex;
  min-height: 240px;
  flex-direction: column;
  padding: 32px;
  box-sizing: border-box;
  border: 1px solid var(--krds-light-color-border-gray-light, #cdd1d5);
  border-radius: 8px;
  background: var(--krds-light-color-surface-white, #ffffff);
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease,
    transform 150ms ease;

  &:hover,
  &:focus-within {
    border-color: var(--krds-light-color-border-gray, #b1b8be);
    box-shadow: 0 8px 24px rgb(0 0 0 / 8%);
    transform: translateY(-2px);
  }

  @media (max-width: 767px) {
    min-height: 224px;
    padding: 28px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover,
    &:focus-within {
      transform: none;
    }
  }
`;

export const ServiceTitle = styled.h3`
  margin: 0;
  color: var(--krds-light-color-text-basic, #1e2124);
  font-size: 19px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0;
`;

export const ServiceDescription = styled.p`
  display: -webkit-box;
  overflow: hidden;
  margin: 16px 0 24px;
  color: var(--krds-light-color-text-subtle, #464c53);
  font-size: 17px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
`;

export const ServiceLink = styled(Link)`
  &.krds-btn.link {
    align-self: flex-end;
    gap: 4px;
    width: auto;
    min-height: 32px;
    margin-top: auto;
    padding: 0 2px;
    color: var(--krds-light-color-text-basic, #1e2124);
    font-size: 17px;
    font-weight: 400;
    line-height: 1.5;
    text-decoration: none;
  }

  &.krds-btn.link:hover {
    color: var(--krds-light-color-text-primary, #0b50d0);
  }

  &.krds-btn.link:focus-visible {
    border-radius: 4px;
    outline: 2px solid var(--krds-light-color-border-primary, #256ef4);
    outline-offset: 2px;
  }
`;

export const ArrowIcon = styled.span`
  display: inline-flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  line-height: 1;
`;
