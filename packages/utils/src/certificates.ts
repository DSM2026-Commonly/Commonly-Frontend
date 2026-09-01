import { ApiError, request, requestBlob } from "./api";

export const CERTIFICATES_ENDPOINT = "/api/certificates";
export const CERTIFICATE_SELF_ENDPOINT = "/api/certificates/self";
export const CERTIFICATE_CREATE_ENDPOINT = "/api/certificates/create";

// 경력 증명 사항 찾기 — 해당 인적사항(humanId)의 경력증명서 행 목록을 반환한다.
export function getHumanCertificatesEndpoint(humanId: number): string {
  return `/api/humans/${humanId}/certificates`;
}

export function getCertificateUpdateEndpoint(certificateId: number): string {
  return `/api/certificates/${certificateId}`;
}

export function getCertificateDownloadEndpoint(certificateId: number): string {
  return `/api/certificates/${certificateId}/download`;
}

export const HUMAN_CERTIFICATES_INVALID_RESPONSE_MESSAGE =
  "경력 사항 응답이 올바르지 않습니다.";
export const HUMAN_CERTIFICATES_BAD_REQUEST_MESSAGE =
  "대상자 정보가 올바르지 않습니다. 다시 조회해 주세요.";
export const HUMAN_CERTIFICATES_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const HUMAN_CERTIFICATES_NOT_FOUND_MESSAGE =
  "대상자의 인적사항을 찾을 수 없습니다. 다시 조회해 주세요.";
export const CERTIFICATE_ISSUE_INVALID_RESPONSE_MESSAGE =
  "증명서 발급 응답이 올바르지 않습니다.";
export const CERTIFICATE_ISSUE_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const CERTIFICATE_ISSUE_NOT_FOUND_MESSAGE =
  "대상 인력 또는 경력사항을 찾을 수 없습니다. 대상자를 다시 조회해 주세요.";
export const CERTIFICATE_ISSUE_CONFLICT_MESSAGE =
  "문서번호 발급이 중복되었습니다. 잠시 후 다시 시도해 주세요.";
export const CERTIFICATE_SELF_ISSUE_FORBIDDEN_MESSAGE =
  "본인 경력만 발급할 수 있습니다.";
export const CERTIFICATE_SELF_ISSUE_NOT_FOUND_MESSAGE =
  "발급할 경력 사항이 없습니다.";
export const SELF_CERTIFICATES_FORBIDDEN_MESSAGE =
  "본인 경력만 조회할 수 있습니다.";
export const SELF_CERTIFICATES_NOT_FOUND_MESSAGE =
  "조회된 경력 사항이 없습니다.";
export const CERTIFICATE_DOWNLOAD_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const CERTIFICATE_DOWNLOAD_FORBIDDEN_MESSAGE =
  "증명서를 내려받을 권한이 없습니다.";
export const CERTIFICATE_DOWNLOAD_NOT_FOUND_MESSAGE =
  "증명서를 찾을 수 없습니다. 다시 발급해 주세요.";
export const CERTIFICATE_UPDATE_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const CERTIFICATE_UPDATE_NOT_FOUND_MESSAGE =
  "해당 경력증명서를 찾을 수 없습니다. 다시 조회해 주세요.";

export interface HumanCertificate {
  certificateId: number;
  /** 구분(채용/전보/해지/퇴직). 근무부서가 아니다. */
  division: string;
  /** 근무부서 */
  department: string;
  employmentType: string;
  /** 직종명 */
  jobTitle: string;
  keyResponsibilities: string;
  hireDate: string;
  retirementDate: string;
  expirationDate: string;
  reason: string;
  note: string;
}

export interface IssueCertificateRequest {
  humanId: number;
  certificateIds: number[];
  purpose: string;
  otherMatters: string;
}

// 민원인 본인 발급 — 대상자는 로그인 토큰으로 정해지므로 humanId 를 받지 않는다.
// certificateIds 를 생략하면 본인의 전체 경력을 발급한다.
export interface IssueSelfCertificateRequest {
  certificateIds?: number[];
  purpose: string;
  otherMatters: string;
}

export interface IssuedCertificate {
  certificateId: number;
  documentNo: string;
  downloadUrl: string;
}

/**
 * 경력증명서 개별 등록(POST /api/certificates/create) 요청 본문.
 * 대상자는 먼저 POST /api/human 으로 만들거나 기존 대상자를 골라 humanId 로 넘긴다.
 * 나머지 필드 구성은 수정 요청과 같고, 날짜가 없으면 null 을 보낸다.
 */
export interface CreateCertificateRequest {
  humanId: number;
  name: string;
  birthDate: string;
  gender: "M" | "F";
  jobTitle: string;
  keyResponsibilities: string;
  hireDate: string;
  expirationDate: string | null;
  retirementDate: string | null;
  division: string;
  reason: string;
  employmentType: string;
  note: string;
}

export interface UpdateCertificateRequest {
  name: string;
  birthDate: string;
  gender: "M" | "F" | "";
  jobTitle: string;
  keyResponsibilities: string;
  hireDate: string;
  expirationDate: string;
  retirementDate: string;
  /** 구분(채용/전보/해지/퇴직). 백엔드가 이 네 값만 허용한다. */
  division: string;
  /** 근무부서 */
  department: string;
  reason: string;
  employmentType: string;
  note: string;
}

export interface CertificateRequestOptions {
  token?: string | null;
  signal?: AbortSignal;
}

// null/누락된 선택 필드는 빈 문자열로 통일하고, 문자열이 아닌 값은 무효(null)로 돌려준다.
function normalizeOptionalString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return "";
  }

  return typeof value === "string" ? value : null;
}

function normalizeHumanCertificate(value: unknown): HumanCertificate | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const {
    certificateId,
    division,
    department,
    employmentType,
    jobTitle,
    keyResponsibilities,
    hireDate,
    retirementDate,
    expirationDate,
    reason,
    note,
  } = value as Record<string, unknown>;

  // 재직 중(퇴직일 없음) 등 선택 필드가 null인 행도 유효해야 하므로
  // certificateId와 hireDate만 필수로 검증한다.
  if (
    typeof certificateId !== "number" ||
    !Number.isFinite(certificateId) ||
    typeof hireDate !== "string"
  ) {
    return null;
  }

  const optionalFields = {
    division: normalizeOptionalString(division),
    department: normalizeOptionalString(department),
    employmentType: normalizeOptionalString(employmentType),
    jobTitle: normalizeOptionalString(jobTitle),
    keyResponsibilities: normalizeOptionalString(keyResponsibilities),
    retirementDate: normalizeOptionalString(retirementDate),
    expirationDate: normalizeOptionalString(expirationDate),
    reason: normalizeOptionalString(reason),
    note: normalizeOptionalString(note),
  };

  if (Object.values(optionalFields).some((field) => field === null)) {
    return null;
  }

  return {
    certificateId,
    hireDate,
    ...(optionalFields as Record<keyof typeof optionalFields, string>),
  };
}

export async function fetchHumanCertificates(
  humanId: number,
  { token, signal }: CertificateRequestOptions = {},
): Promise<HumanCertificate[]> {
  const response = await request<unknown>(getHumanCertificatesEndpoint(humanId), {
    token,
    signal,
    errorMessages: {
      400: HUMAN_CERTIFICATES_BAD_REQUEST_MESSAGE,
      401: HUMAN_CERTIFICATES_UNAUTHORIZED_MESSAGE,
      404: HUMAN_CERTIFICATES_NOT_FOUND_MESSAGE,
    },
  });

  return normalizeHumanCertificates(response);
}

function normalizeHumanCertificates(response: unknown): HumanCertificate[] {
  if (!Array.isArray(response)) {
    throw new ApiError(200, HUMAN_CERTIFICATES_INVALID_RESPONSE_MESSAGE);
  }

  const certificates: HumanCertificate[] = [];

  for (const row of response) {
    const certificate = normalizeHumanCertificate(row);

    if (certificate) {
      certificates.push(certificate);
    }
  }

  return certificates;
}

/** 민원인 본인의 경력증명 사항 목록. 대상자는 로그인 토큰으로 정해진다. */
export async function fetchSelfCertificates({
  token,
  signal,
}: CertificateRequestOptions = {}): Promise<HumanCertificate[]> {
  const response = await request<unknown>(CERTIFICATE_SELF_ENDPOINT, {
    token,
    signal,
    errorMessages: {
      401: HUMAN_CERTIFICATES_UNAUTHORIZED_MESSAGE,
      403: SELF_CERTIFICATES_FORBIDDEN_MESSAGE,
      404: SELF_CERTIFICATES_NOT_FOUND_MESSAGE,
    },
  });

  return normalizeHumanCertificates(response);
}

function normalizeIssuedCertificate(value: unknown): IssuedCertificate | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const { certificateId, documentNo, downloadUrl } = value as Record<
    string,
    unknown
  >;

  if (
    typeof certificateId !== "number" ||
    !Number.isFinite(certificateId) ||
    typeof documentNo !== "string" ||
    typeof downloadUrl !== "string"
  ) {
    return null;
  }

  return { certificateId, documentNo, downloadUrl };
}

export async function issueCertificate(
  requestBody: IssueCertificateRequest,
  { token, signal }: CertificateRequestOptions = {},
): Promise<IssuedCertificate> {
  const response = await request<unknown>(CERTIFICATES_ENDPOINT, {
    method: "POST",
    body: requestBody,
    token,
    signal,
    errorMessages: {
      401: CERTIFICATE_ISSUE_UNAUTHORIZED_MESSAGE,
      404: CERTIFICATE_ISSUE_NOT_FOUND_MESSAGE,
      409: CERTIFICATE_ISSUE_CONFLICT_MESSAGE,
    },
  });

  const issued = normalizeIssuedCertificate(response);

  if (!issued) {
    throw new ApiError(201, CERTIFICATE_ISSUE_INVALID_RESPONSE_MESSAGE);
  }

  return issued;
}

export async function issueSelfCertificate(
  requestBody: IssueSelfCertificateRequest,
  { token, signal }: CertificateRequestOptions = {},
): Promise<IssuedCertificate> {
  const response = await request<unknown>(CERTIFICATE_SELF_ENDPOINT, {
    method: "POST",
    body: requestBody,
    token,
    signal,
    errorMessages: {
      401: CERTIFICATE_ISSUE_UNAUTHORIZED_MESSAGE,
      403: CERTIFICATE_SELF_ISSUE_FORBIDDEN_MESSAGE,
      404: CERTIFICATE_SELF_ISSUE_NOT_FOUND_MESSAGE,
    },
  });

  const issued = normalizeIssuedCertificate(response);

  if (!issued) {
    throw new ApiError(201, CERTIFICATE_ISSUE_INVALID_RESPONSE_MESSAGE);
  }

  return issued;
}

// downloadUrl을 <a href>로 직접 쓰면 Authorization 헤더를 붙일 수 없어 blob으로 받는다.
export async function downloadCertificate(
  certificateId: number,
  { token, signal }: CertificateRequestOptions = {},
): Promise<Blob> {
  return requestBlob(getCertificateDownloadEndpoint(certificateId), {
    token,
    signal,
    errorMessages: {
      401: CERTIFICATE_DOWNLOAD_UNAUTHORIZED_MESSAGE,
      403: CERTIFICATE_DOWNLOAD_FORBIDDEN_MESSAGE,
      404: CERTIFICATE_DOWNLOAD_NOT_FOUND_MESSAGE,
    },
  });
}

export const CERTIFICATE_CREATE_BAD_REQUEST_MESSAGE =
  "입력값이 올바르지 않습니다. 입력 내용을 확인해 주세요.";
export const CERTIFICATE_CREATE_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const CERTIFICATE_CREATE_CONFLICT_MESSAGE =
  "동일한 대상자의 경력사항이 이미 등록되어 있습니다.";

export async function createCertificate(
  body: CreateCertificateRequest,
  { token, signal }: CertificateRequestOptions = {},
): Promise<void> {
  // 201 Created. 응답 본문 형식이 명세에 없어 검증하지 않는다.
  await request<unknown>(CERTIFICATE_CREATE_ENDPOINT, {
    method: "POST",
    body,
    token,
    signal,
    errorMessages: {
      400: CERTIFICATE_CREATE_BAD_REQUEST_MESSAGE,
      401: CERTIFICATE_CREATE_UNAUTHORIZED_MESSAGE,
      409: CERTIFICATE_CREATE_CONFLICT_MESSAGE,
    },
  });
}

export async function updateCertificate(
  certificateId: number,
  body: UpdateCertificateRequest,
  { token, signal }: CertificateRequestOptions = {},
): Promise<void> {
  // 204 No Content 응답이라 본문 검증 없이 성공으로 처리한다.
  // 에러 명세가 없어 401/404만 방어적으로 매핑한다.
  await request<unknown>(getCertificateUpdateEndpoint(certificateId), {
    method: "PUT",
    body,
    token,
    signal,
    errorMessages: {
      401: CERTIFICATE_UPDATE_UNAUTHORIZED_MESSAGE,
      404: CERTIFICATE_UPDATE_NOT_FOUND_MESSAGE,
    },
  });
}

export function saveBlobAsFile(blob: Blob, filename: string): void {
  if (typeof document === "undefined" || typeof URL === "undefined") {
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  // 브라우저가 Blob URL 읽기를 시작한 뒤에 정리해야 다운로드가 끊기지 않는다.
  setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 0);
}
