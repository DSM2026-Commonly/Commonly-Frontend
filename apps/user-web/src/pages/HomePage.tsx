import { UserHome } from "@commonly/ui";
import { useNavigate } from "react-router";

function HomePage() {
  const navigate = useNavigate();

  return <UserHome onNavigate={(href) => void navigate(href)} />;
}

export default HomePage;
