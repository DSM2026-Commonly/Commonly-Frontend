import type { PagedResult } from "../pagination/Pagination";

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

/**
 * 서버가 만든 미리보기 PDF 상태.
 * idle 은 onPreview 가 없어 요청하지 않은 상태, failed 는 요청이 실패한 상태로
 * 둘 다 입력값으로 그린 미리보기를 대신 보여준다.
 */
/**
 * 민원인 본인 경력 목록 조회 결과. 목록이 비어 있을 때 안내 문구를 고르는 데 쓴다.
 * - unavailable: 서버가 거부(401/403). 본인 발급 경로가 닫혀 있다는 뜻이다.
 * - failed: 그 밖의 실패(네트워크, 5xx).
 * - loaded: 조회 성공. 0건일 수 있다.
 */
export type OwnCareerLoadStatus =
  | "idle"
  | "loading"
  | "loaded"
  | "unavailable"
  | "failed";

export type CertificatePreviewPdfState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; pdf: Blob }
  | { status: "failed" };

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
    /** 조회할 페이지(1부터 시작). */
    page: number;
  }) => Promise<PagedResult<CertificateApplicant>>;
  /**
   * 대상자의 경력 목록. 담당자는 대상자 입력 단계를 마칠 때, 민원인은 화면에 들어올 때 부른다.
   * 민원인은 본인 목록이라 applicantId 가 빈 문자열이고, 실패해도 전체 발급으로 진행한다.
   */
  onLoadCareerRows?: (
    applicantId: string,
  ) => Promise<readonly CertificateCareerRow[]>;
  /**
   * 미리보기 화면에 띄울 서버 PDF. 발급과 같은 값을 받는다.
   * 없거나 실패하면 입력값으로 그린 미리보기를 보여준다.
   */
  onPreview?: (data: CareerCertificateApplicationData) => Promise<Blob>;
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
