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

/** 완료 화면에 표시하는 발급 결과. 발급 직후와 새로고침 복구 양쪽에서 쓴다. */
export interface IssuedCertificateSummary {
  documentNo: string;
  /** 발급 시각(ISO LocalDateTime). 비어 있으면 발급일을 표시하지 않는다. */
  issuedAt: string;
}

/** 새로고침 뒤 복구한 발급 결과. 대상자명과 발급 구분까지 되살린다. */
export interface RestoredIssuedCertificate extends IssuedCertificateSummary {
  applicantName: string;
  issueType: CertificateIssueType;
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
  /** 발급 결과를 돌려주면 완료 화면에 문서번호·발급일을 표시한다. */
  onComplete?: (
    data: CareerCertificateApplicationData,
  ) => void | Promise<void | IssuedCertificateSummary>;
  onDownload?: () => void | Promise<void>;
  /**
   * 화면 진입 시 직전 발급 결과를 복구한다. 값을 돌려주면 완료 화면에서 시작하고,
   * null 을 돌려주면 평소처럼 처음부터 시작한다.
   */
  onRestoreIssued?: () => Promise<RestoredIssuedCertificate | null>;
  /** "추가 발급하기"로 흐름을 다시 시작할 때 보관된 발급 결과를 정리하도록 알린다. */
  onRestart?: () => void;
}
