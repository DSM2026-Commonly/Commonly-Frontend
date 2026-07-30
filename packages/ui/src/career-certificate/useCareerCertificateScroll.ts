import useCareerFlowScroll from "../career-flow/useCareerFlowScroll";
import type { CareerCertificateIssueView } from "./CareerCertificateIssue.types";

function useCareerCertificateScroll(view: CareerCertificateIssueView) {
  useCareerFlowScroll(view);
}

export default useCareerCertificateScroll;
