import { LoginPage } from "@commonly/ui";

// 공통 구현은 @commonly/ui 의 공유 페이지에 있고, civil 변형만 지정한다.
function CivilLoginPage() {
  return <LoginPage signupHref="/signup" variant="civil" />;
}

export default CivilLoginPage;
