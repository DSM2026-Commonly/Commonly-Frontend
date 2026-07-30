import { CareerEdit } from "@commonly/ui";
import { useNavigate } from "react-router";

function CareerEditPage() {
  const navigate = useNavigate();
  const navigateHome = () => void navigate("/");

  return <CareerEdit onCancel={navigateHome} onHome={navigateHome} />;
}

export default CareerEditPage;
