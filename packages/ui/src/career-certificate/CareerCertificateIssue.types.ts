export type CareerCertificateIssueView =
  | "notice"
  | "reason"
  | "applicant"
  | "details"
  | "preview"
  | "success";

export type CertificateIssueType = "all" | "selected";

export type CareerCertificateIssueVariant = "staff" | "civil";

export interface CertificateApplicant {
  id: string;
  name: string;
  birthDate: string;
  address: string;
}

export interface CertificateCareerRow {
  id: string;
  job: string;
  department: string;
  period: string;
}

export interface CareerCertificateApplicationData {
  issueType: CertificateIssueType;
  reason: string;
  note: string;
  applicantId: string;
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
  /** 대상자 조회 단계가 없는 민원인 변형에서 미리보기·완료 화면에 표시할 본인 이름. */
  applicantName?: string;
  onCancel?: () => void;
  onSearchApplicants?: (query: {
    name: string;
    birthDate: string;
  }) => Promise<readonly CertificateApplicant[]>;
  onLoadCareerRows?: (
    applicantId: string,
  ) => Promise<readonly CertificateCareerRow[]>;
  onComplete?: (data: CareerCertificateApplicationData) => void | Promise<void>;
  onDownload?: () => void | Promise<void>;
}
