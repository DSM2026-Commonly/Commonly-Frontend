import { ApplicationShell } from "@commonly/ui";
import styled from "@emotion/styled";
import { Button } from "krds-react";
import { Link, useNavigate } from "react-router";
import { requestTestSignupIdentity } from "./signupVerification";

const SignupContent = styled.section`
  width: min(792px, calc(100% - 40px));
  height: 855px;
  margin: 88px auto 0;
  box-sizing: border-box;
  color: #1e2124;
  font-family:
    "Pretendard GOV", Pretendard, "Noto Sans KR", "Malgun Gothic", sans-serif;

  @media (max-width: 767px) {
    height: auto;
    margin-top: 40px;
    padding-bottom: 48px;
  }
`;

const HeadingArea = styled.header`
  display: flex;
  height: 99px;
  flex-direction: column;
  gap: 16px;
`;

const Eyebrow = styled.p`
  margin: 0;
  color: #464c53;
  font-size: 15px;
  font-weight: 700;
  line-height: 23px;
`;

const Heading = styled.h1`
  margin: 0;
  color: #131416;
  font-size: 40px;
  font-weight: 700;
  line-height: 60px;
  letter-spacing: 1px;

  @media (max-width: 767px) {
    font-size: 32px;
    line-height: 48px;
  }
`;

const SignupBody = styled.div`
  height: 644px;
  margin-top: 48px;

  @media (max-width: 767px) {
    height: auto;
    margin-top: 32px;
  }
`;

const VerificationPanel = styled.div`
  position: relative;
  height: 508px;
  box-sizing: border-box;
  border-top: 1px solid #8a949e;
  border-bottom: 1px solid #8a949e;

  @media (max-width: 767px) {
    height: auto;
    padding: 72px 0 32px;
  }
`;

const VerificationButton = styled(Button)`
  &.krds-btn {
    position: absolute;
    top: 210px;
    left: 50%;
    width: min(480px, calc(100% - 32px));
    min-width: 0;
    height: 56px;
    min-height: 56px;
    padding: 0 20px;
    border-radius: 8px;
    transform: translateX(-50%);
    font-size: 17px;
    font-weight: 700;
    line-height: 1.5;
  }

  @media (max-width: 767px) {
    &.krds-btn {
      position: static;
      width: 100%;
      transform: none;
    }
  }
`;

const AccountLinks = styled.nav`
  position: absolute;
  top: 456px;
  left: 50%;
  display: flex;
  min-height: 32px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transform: translateX(-50%);
  white-space: nowrap;

  @media (max-width: 767px) {
    position: static;
    margin-top: 64px;
    transform: none;
  }
`;

const AccountLink = styled(Link)`
  padding: 3px 2px;
  border-radius: 4px;
  color: #464c53;
  font-size: 15px;
  line-height: 26px;
  text-decoration: none;

  &:hover {
    color: #0b50d0;
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid #246beb;
    outline-offset: 2px;
  }
`;

const AccountLinkSeparator = styled.span`
  width: 1px;
  height: 16px;
  background: #cdd1d5;
`;

const HelpCard = styled.aside`
  width: 100%;
  height: 96px;
  margin-top: 40px;
  padding: 16px 24px;
  box-sizing: border-box;
  border: 1px solid #d6e0eb;
  border-radius: 12px;
  background: #eef2f7;

  @media (max-width: 767px) {
    height: auto;
    padding: 16px 20px;
  }
`;

const HelpTitle = styled.h2`
  display: flex;
  margin: 0;
  align-items: center;
  gap: 8px;
  color: #052b57;
  font-size: 16px;
  font-weight: 700;
  line-height: 26px;
`;

const HelpIcon = styled.span`
  display: inline-flex;
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  background: #052b57;
  font-size: 12px;
  line-height: 1;
`;

const HelpText = styled.p`
  position: relative;
  margin: 12px 0 0;
  padding-left: 32px;
  color: #464c53;
  font-size: 15px;
  line-height: 26px;

  &::before {
    position: absolute;
    top: 10px;
    left: 8px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #464c53;
    content: "";
  }
`;

function SignupPage() {
  const navigate = useNavigate();

  const handleVerification = () => {
    const verifiedIdentity = requestTestSignupIdentity();

    if (verifiedIdentity === null) {
      return;
    }

    void navigate("/signup/form", { state: { verifiedIdentity } });
  };

  return (
    <ApplicationShell headerVariant="not-auth" fillViewport={false}>
      <SignupContent aria-labelledby="signup-title">
        <HeadingArea>
          <Eyebrow>유성구 경력관리 시스템 사용자</Eyebrow>
          <Heading id="signup-title">회원가입</Heading>
        </HeadingArea>

        <SignupBody>
          <VerificationPanel>
            <VerificationButton
              variant="primary"
              size="large"
              type="button"
              onClick={handleVerification}
            >
              본인인증
            </VerificationButton>

            <AccountLinks aria-label="계정 도움말 바로가기">
              <AccountLink to="/login">아이디 찾기</AccountLink>
              <AccountLinkSeparator aria-hidden="true" />
              <AccountLink to="/login">비밀번호 찾기</AccountLink>
              <AccountLinkSeparator aria-hidden="true" />
              <AccountLink to="/login">로그인</AccountLink>
            </AccountLinks>
          </VerificationPanel>

          <HelpCard aria-labelledby="signup-help-title">
            <HelpTitle id="signup-help-title">
              <HelpIcon aria-hidden="true">i</HelpIcon>
              회원가입에 어려움이 있으신가요?
            </HelpTitle>
            <HelpText>
              042-611-2114으로 전화주세요. 서비스에 가입할 수 있도록
              도와드리겠습니다.
            </HelpText>
          </HelpCard>
        </SignupBody>
      </SignupContent>
    </ApplicationShell>
  );
}

export default SignupPage;
