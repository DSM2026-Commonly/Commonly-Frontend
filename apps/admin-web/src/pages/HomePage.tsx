import { UserHome } from "@commonly/ui";
import { useNavigate } from "react-router";

function HomePage() {
  const navigate = useNavigate();

  // 관리자 화면이므로 민원 서비스 대신 업무 진입점으로 표기한다.
  return (
    <UserHome
      servicesTitle="업무 바로가기"
      onNavigate={(href) => void navigate(href)}
    />
  );
}

export default HomePage;
