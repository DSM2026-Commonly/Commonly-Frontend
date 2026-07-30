import styled from "@emotion/styled";

export interface RoutePlaceholderPageProps {
  title: string;
  description: string;
}

const PageSection = styled.section`
  width: min(1200px, calc(100% - 48px));
  margin: 0 auto;
  padding: 64px 0;
  color: #1e2124;
  font-family:
    "Pretendard GOV", Pretendard, "Noto Sans KR", "Malgun Gothic", sans-serif;

  @media (max-width: 767px) {
    width: calc(100% - 40px);
    padding: 40px 0;
  }
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 32px;
  line-height: 1.4;

  @media (max-width: 767px) {
    font-size: 26px;
  }
`;

const PageDescription = styled.p`
  margin: 16px 0 0;
  color: #464c53;
  font-size: 17px;
  line-height: 1.6;
`;

function RoutePlaceholderPage({
  title,
  description,
}: RoutePlaceholderPageProps) {
  return (
    <PageSection aria-labelledby="route-page-title">
      <PageTitle id="route-page-title">{title}</PageTitle>
      <PageDescription>{description}</PageDescription>
    </PageSection>
  );
}

export default RoutePlaceholderPage;
