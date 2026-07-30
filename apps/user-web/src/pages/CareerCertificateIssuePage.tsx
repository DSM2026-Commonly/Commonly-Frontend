import { CareerCertificateIssue } from "@commonly/ui";
import { useNavigate } from "react-router";

function CareerCertificateIssuePage() {
  const navigate = useNavigate();

  return <CareerCertificateIssue onCancel={() => void navigate("/")} />;
}

export default CareerCertificateIssuePage;
