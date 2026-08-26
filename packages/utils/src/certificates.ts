import { ApiError, request } from "./api";

// 경력 증명 사항 찾기 — 해당 인적사항(humanId)의 경력증명서 행 목록을 반환한다.
export function getHumanCertificatesEndpoint(humanId: number): string {
  return `/api/certificates/${humanId}`;
}

// 경력증명서 수정 — certificateId 기준. (명세상 목록 조회와 동일 경로 패턴 — 백엔드 확인 사항)
export function getCertificateUpdateEndpoint(certificateId: number): string {
  return `/api/certificates/${certificateId}`;
}

export const HUMAN_CERTIFICATES_INVALID_RESPONSE_MESSAGE =
  "경력 사항 응답이 올바르지 않습니다.";
export const HUMAN_CERTIFICATES_BAD_REQUEST_MESSAGE =
  "대상자 정보가 올바르지 않습니다. 다시 조회해 주세요.";
export const HUMAN_CERTIFICATES_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const HUMAN_CERTIFICATES_NOT_FOUND_MESSAGE =
  "대상자의 인적사항을 찾을 수 없습니다. 다시 조회해 주세요.";
export const CERTIFICATE_UPDATE_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const CERTIFICATE_UPDATE_NOT_FOUND_MESSAGE =
  "해당 경력증명서를 찾을 수 없습니다. 다시 조회해 주세요.";

export interface HumanCertificate {
  certificateId: number;
  division: string;
  employmentType: string;
  keyResponsibilities: string;
  hireDate: string;
  retirementDate: string;
  expirationDate: string;
  reason: string;
  note: string;
}

// 백엔드 명세가 이 엔드포인트만 snake_case 필드를 사용한다 (2026-08-26 기준).
export interface UpdateCertificateRequest {
  name: string;
  birth_date: string;
  gender: "M" | "F" | "";
  job_title: string;
  key_responsibilities: string;
  hire_date: string;
  expiration_date: string;
  retirement_date: string;
  division: string;
  reason: string;
  employment_type: string;
  note: string;
}

export interface CertificateRequestOptions {
  token?: string | null;
  signal?: AbortSignal;
}

function normalizeHumanCertificate(value: unknown): HumanCertificate | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const {
    certificateId,
    division,
    employmentType,
    keyResponsibilities,
    hireDate,
    retirementDate,
    expirationDate,
    reason,
    note,
  } = value as Record<string, unknown>;

  if (
    typeof certificateId !== "number" ||
    !Number.isFinite(certificateId) ||
    typeof division !== "string" ||
    typeof employmentType !== "string" ||
    typeof keyResponsibilities !== "string" ||
    typeof hireDate !== "string" ||
    typeof retirementDate !== "string" ||
    typeof expirationDate !== "string" ||
    typeof reason !== "string" ||
    typeof note !== "string"
  ) {
    return null;
  }

  return {
    certificateId,
    division,
    employmentType,
    keyResponsibilities,
    hireDate,
    retirementDate,
    expirationDate,
    reason,
    note,
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

export async function updateCertificate(
  certificateId: number,
  body: UpdateCertificateRequest,
  { token, signal }: CertificateRequestOptions = {},
): Promise<void> {
  // 명세의 200 응답 바디({insertedCount, failedRows})는 복붙 오류로 보여 무시한다.
  // 에러 명세도 없어 401/404만 방어적으로 매핑한다.
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
