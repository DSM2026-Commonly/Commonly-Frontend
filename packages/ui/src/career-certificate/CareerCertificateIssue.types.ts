export type CareerCertificateIssueView =
  | "notice"
  | "reason"
  | "applicant"
  | "details"
  | "preview"
  | "success";

export type CertificateIssueType = "all" | "selected";

export type CareerCertificateIssueVariant = "staff" | "civil";

export interface CareerCertificateApplicationData {
  issueType: CertificateIssueType;
  reason: string;
  note: string;
  applicantName: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  selectedCareerIds: string[];
  additionalNote: string;
  purpose: string;
}

export interface CareerCertificateIssueProps {
  initialView?: CareerCertificateIssueView;
  variant?: CareerCertificateIssueVariant;
  onCancel?: () => void;
  onComplete?: (data: CareerCertificateApplicationData) => void;
  onDownload?: () => void;
}
