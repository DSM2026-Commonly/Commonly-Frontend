import styled from "@emotion/styled";
import { Link } from "react-router";

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
`;

const PageDescription = styled.p`
  margin: 16px 0 24px;
  color: #464c53;
  font-size: 17px;
  line-height: 1.6;
`;

const HomeLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  padding: 0 20px;
  border-radius: 6px;
  background: #246beb;
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    background: #1d56bc;
  }

  &:focus-visible {
    outline: 2px solid #246beb;
    outline-offset: 3px;
  }
`;

function NotFoundPage() {
  return (
    <PageSection aria-labelledby="not-found-title">
      <PageTitle id="not-found-title">페이지를 찾을 수 없습니다.</PageTitle>
      <PageDescription>
        요청하신 주소가 올바른지 다시 확인해 주세요.
      </PageDescription>
      <HomeLink to="/">홈으로 돌아가기</HomeLink>
    </PageSection>
  );
}

export default NotFoundPage;
