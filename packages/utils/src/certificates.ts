import { ApiError, request, requestBlob } from "./api";

export const CERTIFICATES_ENDPOINT = "/api/certificates";
export const CERTIFICATE_SELF_ENDPOINT = "/api/certificates/self";
export const CERTIFICATE_PREVIEW_ENDPOINT = "/api/certificates/preview";
export const CERTIFICATE_SELF_PREVIEW_ENDPOINT = "/api/certificates/self/preview";
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

// 발급 상세 조회. 수정(PUT)과 같은 경로를 GET 으로 부른다.
export function getCertificateDetailEndpoint(certificateId: number): string {
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
export const CERTIFICATE_ISSUE_INVALID_RESPONSE_MESSAGE =
  "증명서 발급 응답이 올바르지 않습니다.";
export const CERTIFICATE_ISSUE_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const CERTIFICATE_ISSUE_NOT_FOUND_MESSAGE =
  "대상 인력 또는 경력사항을 찾을 수 없습니다. 대상자를 다시 조회해 주세요.";
export const CERTIFICATE_ISSUE_CONFLICT_MESSAGE =
  "문서번호 발급이 중복되었습니다. 잠시 후 다시 시도해 주세요.";
/**
 * 본인 발급 경로(GET·POST /self, POST /self/preview)는 백엔드 스위치
 * (CERTIFICATE_SELF_ISSUE_ENABLED, 기본 false)가 꺼져 있으면 막히고, 켜져도 PETITIONER 권한이 있어야 열린다.
 * 막히면 403 이 온다. 401 은 미인증(로그인 만료)일 때만 온다.
 */
export const CERTIFICATE_SELF_ISSUE_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
/** 403. 스위치가 꺼져 있거나(SELF_ISSUE_DISABLED) 민원인 권한이 아닌 경우 모두 같은 안내를 쓴다. */
export const CERTIFICATE_SELF_ISSUE_FORBIDDEN_MESSAGE =
  "본인 발급은 현재 사용할 수 없습니다.";
/** CERTIFICATE_LIMIT_EXCEEDED(400). 고르지 않고 전체를 발급하려는데 재직 이력이 10건을 넘는 경우. */
export const CERTIFICATE_LIMIT_EXCEEDED_MESSAGE =
  "재직 이력이 10건을 넘어 본인 발급이 불가능합니다. 민원 담당자에게 문의하세요.";
/** PETITIONER_HUMAN_NOT_MATCHED(404). 민원인 계정의 성명·생년월일과 맞는 인적사항이 없다. */
export const PETITIONER_HUMAN_NOT_MATCHED_MESSAGE =
  "계정 정보와 일치하는 인적사항이 없습니다.";
/** 본인 발급의 CERTIFICATE_NOT_FOUND(404). 본인 재직 이력이 없거나 고른 이력이 본인 것이 아니다. */
export const SELF_CERTIFICATE_NOT_FOUND_MESSAGE =
  "발급할 본인 경력 사항을 찾을 수 없습니다. 민원 담당자에게 문의하세요.";
export const CERTIFICATE_PREVIEW_INVALID_RESPONSE_MESSAGE =
  "증명서 미리보기 응답이 올바르지 않습니다.";
export const CERTIFICATE_DOWNLOAD_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const CERTIFICATE_DOWNLOAD_FORBIDDEN_MESSAGE =
  "증명서를 내려받을 권한이 없습니다.";
export const CERTIFICATE_DOWNLOAD_NOT_FOUND_MESSAGE =
  "증명서를 찾을 수 없습니다. 다시 발급해 주세요.";
export const CERTIFICATE_UPDATE_BAD_REQUEST_MESSAGE =
  "입력값이 올바르지 않습니다. 입력 내용을 확인해 주세요.";
export const CERTIFICATE_UPDATE_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const CERTIFICATE_UPDATE_NOT_FOUND_MESSAGE =
  "해당 경력증명서를 찾을 수 없습니다. 다시 조회해 주세요.";
export const CERTIFICATE_DETAIL_INVALID_RESPONSE_MESSAGE =
  "발급 증명서 응답이 올바르지 않습니다.";
export const CERTIFICATE_DETAIL_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const CERTIFICATE_DETAIL_FORBIDDEN_MESSAGE =
  "증명서를 조회할 권한이 없습니다.";
export const CERTIFICATE_DETAIL_NOT_FOUND_MESSAGE =
  "발급된 증명서를 찾을 수 없습니다.";

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

// 민원인 본인 발급 — 대상자는 로그인 토큰에서 정해지므로 humanId 를 보내지 않는다.
export interface IssueSelfCertificateRequest {
  purpose: string;
  otherMatters: string;
  /**
   * GET /api/certificates/self 목록에서 고른 재직 이력(10건까지). 생략하면 본인 전체가 발급되고,
   * 전체가 10건을 넘으면 400(CERTIFICATE_LIMIT_EXCEEDED)이다.
   */
  certificateIds?: number[];
}

export interface IssuedCertificate {
  certificateId: number;
  documentNo: string;
  downloadUrl: string;
}

/** 발급 상세의 대상자 인적사항. */
export interface CertificateDetailHuman {
  humanId: number;
  name: string;
  birthDate: string;
  gender: string;
  address: string;
}

/** 발급된 증명서 상세(GET /api/certificates/{certificateId}). */
export interface CertificateDetail {
  certificateId: number;
  documentNo: string;
  /** 발급 시각(ISO LocalDateTime). 응답에 없으면 빈 문자열. */
  issuedAt: string;
  purpose: string;
  otherMatters: string;
  /** 대상자 정보가 없으면 null. */
  human: CertificateDetailHuman | null;
  totalMonths: number;
  totalDays: number;
  /** 증명서에 찍힌 재직 이력. */
  items: HumanCertificate[];
}

/**
 * 경력증명서 개별 등록(POST /api/certificates/create) 요청 본문.
 * 대상자는 먼저 POST /api/human 으로 만들거나 기존 대상자를 골라 humanId 로 넘긴다.
 * 성명·생년월일·성별은 백엔드가 humanId 로 대상자 행에서 가져오므로 보내지 않는다.
 * 구분/근무형태는 허용값이 정해져 있고 빈 문자열은 400 이라, 입력란이 없으면 null 을 보낸다.
 * 날짜가 없으면 null 을 보낸다.
 */
export interface CreateCertificateRequest {
  humanId: number;
  jobTitle: string;
  keyResponsibilities: string;
  hireDate: string;
  expirationDate: string | null;
  retirementDate: string | null;
  /** 구분(채용/전보/해지/퇴직). 모르면 null. */
  division: string | null;
  /** 근무부서 */
  department: string;
  reason: string;
  /** 근무형태(기간제/단시간근로자). 모르면 null. */
  employmentType: string | null;
  note: string;
}

export interface CreatedCertificate {
  /**
   * 등록된 재직 이력 id. 발급 요청의 certificateIds 에 그대로 넣는 값이다.
   * 201 본문에서 id 를 읽지 못하면 null (등록 자체는 된 것이다).
   */
  certificateId: number | null;
}

/**
 * 경력증명서 한 줄 수정(PUT /api/certificates/{certificateId}) 요청 본문.
 *
 * 성별 표기가 엔드포인트마다 다르다 — /api/human 은 M/F(@JsonValue) 지만 이 엔드포인트의
 * Gender 에는 Jackson 애너테이션이 없어 enum 이름(MALE/FEMALE)으로 읽힌다.
 * M/F 나 빈 문자열을 보내면 @NotNull 검증에 걸려 400 이다.
 *
 * 구분/근무형태는 허용값 검증(@AssertTrue)이 있어 빈 문자열이면 400 이다. 모르면 null 을 보낸다.
 * 날짜도 빈 문자열은 LocalDate 로 읽히지 않으므로 값이 없으면 null 을 보낸다.
 */
export interface UpdateCertificateRequest {
  name: string;
  birthDate: string | null;
  gender: "MALE" | "FEMALE";
  jobTitle: string;
  keyResponsibilities: string;
  hireDate: string | null;
  expirationDate: string | null;
  retirementDate: string | null;
  /** 구분(채용/전보/해지/퇴직). 모르면 null. */
  division: string | null;
  /** 근무부서 */
  department: string;
  reason: string;
  /** 근무형태(기간제/단시간근로자). 모르면 null. */
  employmentType: string | null;
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

export const HUMAN_DELETE_HAS_CAREERS_MESSAGE =
  "경력 사항이 등록된 대상자는 삭제할 수 없습니다.";

/**
 * 대상자를 지워도 되는지 확인한다. 경력 사항이 하나라도 있으면 HUMAN_DELETE_HAS_CAREERS_MESSAGE 로 실패한다.
 * 백엔드는 대상자 행만 지우고 연결된 경력·발급 기록을 처리하지 않아, 지우면 500 이 나거나
 * 그 사람의 발급 기록이 업무 이력에서 사라진다. 발급에는 경력이 필요하고 경력 삭제 API 는 없으므로
 * 경력이 없는 대상자는 발급 기록도 없다.
 * 화면에 못 그리는 행(채용일 없음 등)도 경력이므로 정규화 전 개수로 판단한다.
 */
export async function assertHumanDeletable(
  humanId: number,
  { token, signal }: CertificateRequestOptions = {},
): Promise<void> {
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

  if (response.length > 0) {
    throw new Error(HUMAN_DELETE_HAS_CAREERS_MESSAGE);
  }
}

/** 민원인 본인 재직 이력 목록. 선택 발급 화면에서 고를 행을 보여준다. 응답 모양은 fetchHumanCertificates 와 같다. */
export async function fetchMyCertificates({
  token,
  signal,
}: CertificateRequestOptions = {}): Promise<HumanCertificate[]> {
  const response = await request<unknown>(CERTIFICATE_SELF_ENDPOINT, {
    token,
    signal,
    errorMessages: {
      401: CERTIFICATE_SELF_ISSUE_UNAUTHORIZED_MESSAGE,
      403: CERTIFICATE_SELF_ISSUE_FORBIDDEN_MESSAGE,
      404: PETITIONER_HUMAN_NOT_MATCHED_MESSAGE,
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

function normalizeCertificateDetailHuman(
  value: unknown,
): CertificateDetailHuman | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const { humanId, name, birthDate, gender, address } = value as Record<
    string,
    unknown
  >;

  if (typeof humanId !== "number" || !Number.isFinite(humanId)) {
    return null;
  }

  const optionalFields = {
    name: normalizeOptionalString(name),
    birthDate: normalizeOptionalString(birthDate),
    gender: normalizeOptionalString(gender),
    address: normalizeOptionalString(address),
  };

  if (Object.values(optionalFields).some((field) => field === null)) {
    return null;
  }

  return {
    humanId,
    ...(optionalFields as Record<keyof typeof optionalFields, string>),
  };
}

function normalizeCertificateDetail(value: unknown): CertificateDetail {
  if (!value || typeof value !== "object") {
    throw new ApiError(200, CERTIFICATE_DETAIL_INVALID_RESPONSE_MESSAGE);
  }

  const {
    certificateId,
    documentNo,
    issuedAt,
    purpose,
    otherMatters,
    human,
    totalMonths,
    totalDays,
    items,
  } = value as Record<string, unknown>;

  // 완료 화면 복구에 반드시 필요한 두 값만 필수로 본다.
  if (
    typeof certificateId !== "number" ||
    !Number.isFinite(certificateId) ||
    typeof documentNo !== "string" ||
    documentNo.trim() === ""
  ) {
    throw new ApiError(200, CERTIFICATE_DETAIL_INVALID_RESPONSE_MESSAGE);
  }

  return {
    certificateId,
    documentNo,
    issuedAt: typeof issuedAt === "string" ? issuedAt : "",
    purpose: typeof purpose === "string" ? purpose : "",
    otherMatters: typeof otherMatters === "string" ? otherMatters : "",
    human: normalizeCertificateDetailHuman(human),
    totalMonths: typeof totalMonths === "number" ? totalMonths : 0,
    totalDays: typeof totalDays === "number" ? totalDays : 0,
    items: Array.isArray(items)
      ? items
          .map(normalizeHumanCertificate)
          .filter((item): item is HumanCertificate => item !== null)
      : [],
  };
}

/** 발급된 증명서 상세. 새로고침 뒤 완료 화면과 다운로드를 복구할 때 쓴다. */
export async function fetchCertificateDetail(
  certificateId: number,
  { token, signal }: CertificateRequestOptions = {},
): Promise<CertificateDetail> {
  const response = await request<unknown>(
    getCertificateDetailEndpoint(certificateId),
    {
      token,
      signal,
      errorMessages: {
        401: CERTIFICATE_DETAIL_UNAUTHORIZED_MESSAGE,
        403: CERTIFICATE_DETAIL_FORBIDDEN_MESSAGE,
        404: CERTIFICATE_DETAIL_NOT_FOUND_MESSAGE,
      },
    },
  );

  return normalizeCertificateDetail(response);
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

/**
 * 본인 발급·본인 미리보기 공통 오류 문구.
 * 같은 404 라도 인적사항 불일치와 경력 없음·남의 id 를, 같은 400 이라도 10건 초과와 입력 검증 실패를
 * 응답 code 로 구분한다. 입력 검증 실패는 백엔드가 짚어준 필드별 문구를 쓴다.
 */
const SELF_CERTIFICATE_ERROR_MESSAGES = {
  CERTIFICATE_LIMIT_EXCEEDED: CERTIFICATE_LIMIT_EXCEEDED_MESSAGE,
  PETITIONER_HUMAN_NOT_MATCHED: PETITIONER_HUMAN_NOT_MATCHED_MESSAGE,
  CERTIFICATE_NOT_FOUND: SELF_CERTIFICATE_NOT_FOUND_MESSAGE,
  401: CERTIFICATE_SELF_ISSUE_UNAUTHORIZED_MESSAGE,
  403: CERTIFICATE_SELF_ISSUE_FORBIDDEN_MESSAGE,
};

export async function issueSelfCertificate(
  requestBody: IssueSelfCertificateRequest,
  { token, signal }: CertificateRequestOptions = {},
): Promise<IssuedCertificate> {
  const response = await request<unknown>(CERTIFICATE_SELF_ENDPOINT, {
    method: "POST",
    body: requestBody,
    token,
    signal,
    errorMessages: SELF_CERTIFICATE_ERROR_MESSAGES,
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

// 미리보기는 200 에 PDF 를 inline 으로 준다. 다른 형식이 오면(프록시가 HTML 을 돌려주는 등)
// 화면에 그대로 띄우지 않도록 오류로 돌려 호출부가 입력값 미리보기로 대신하게 한다.
function ensurePdfBlob(blob: Blob): Blob {
  if (
    blob.size === 0 ||
    !blob.type.toLowerCase().startsWith("application/pdf")
  ) {
    throw new ApiError(200, CERTIFICATE_PREVIEW_INVALID_RESPONSE_MESSAGE);
  }

  return blob;
}

/** 발급 전 미리보기. 발급과 같은 본문을 보내며, 문서번호 자리에 "미리보기"가 찍히고 서버에 아무것도 남지 않는다. */
export async function previewCertificate(
  requestBody: IssueCertificateRequest,
  { token, signal }: CertificateRequestOptions = {},
): Promise<Blob> {
  const blob = await requestBlob(CERTIFICATE_PREVIEW_ENDPOINT, {
    method: "POST",
    body: requestBody,
    token,
    signal,
    errorMessages: {
      401: CERTIFICATE_ISSUE_UNAUTHORIZED_MESSAGE,
      404: CERTIFICATE_ISSUE_NOT_FOUND_MESSAGE,
    },
  });

  return ensurePdfBlob(blob);
}

/** 민원인 본인 발급 미리보기. 본인 발급과 같은 본문을 보낸다. */
export async function previewSelfCertificate(
  requestBody: IssueSelfCertificateRequest,
  { token, signal }: CertificateRequestOptions = {},
): Promise<Blob> {
  const blob = await requestBlob(CERTIFICATE_SELF_PREVIEW_ENDPOINT, {
    method: "POST",
    body: requestBody,
    token,
    signal,
    errorMessages: SELF_CERTIFICATE_ERROR_MESSAGES,
  });

  return ensurePdfBlob(blob);
}

export const CERTIFICATE_CREATE_BAD_REQUEST_MESSAGE =
  "입력값이 올바르지 않습니다. 입력 내용을 확인해 주세요.";
export const CERTIFICATE_CREATE_UNAUTHORIZED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";
export const CERTIFICATE_CREATE_HUMAN_NOT_FOUND_MESSAGE =
  "대상자를 찾을 수 없습니다. 대상자 정보 입력 단계부터 다시 진행해 주세요.";

export async function createCertificate(
  body: CreateCertificateRequest,
  { token, signal }: CertificateRequestOptions = {},
): Promise<CreatedCertificate> {
  // 201 Created, 본문은 { certificateId }. 백엔드는 400/401/404 만 낸다(중복 검사 없음).
  const response = await request<unknown>(CERTIFICATE_CREATE_ENDPOINT, {
    method: "POST",
    body,
    token,
    signal,
    errorMessages: {
      400: CERTIFICATE_CREATE_BAD_REQUEST_MESSAGE,
      401: CERTIFICATE_CREATE_UNAUTHORIZED_MESSAGE,
      404: CERTIFICATE_CREATE_HUMAN_NOT_FOUND_MESSAGE,
    },
  });

  // 201 이 왔으면 행은 이미 저장된 뒤다. 본문이 어긋난다고 오류로 돌리면 사용자가 다시 등록해
  // 같은 경력이 두 번 쌓이므로(백엔드에 중복 검사 없음), id 만 못 읽은 것으로 처리한다.
  const certificateId =
    response && typeof response === "object"
      ? (response as Record<string, unknown>).certificateId
      : undefined;

  return {
    certificateId:
      typeof certificateId === "number" &&
      Number.isInteger(certificateId) &&
      certificateId > 0
        ? certificateId
        : null,
  };
}

export async function updateCertificate(
  certificateId: number,
  body: UpdateCertificateRequest,
  { token, signal }: CertificateRequestOptions = {},
): Promise<void> {
  // 204 No Content 응답이라 본문 검증 없이 성공으로 처리한다.
  // 에러 명세가 없어 400/401/404만 방어적으로 매핑한다.
  // 검증 실패 400 은 백엔드가 `error` 맵으로 필드별 사유를 주므로 그 문구가 먼저 쓰인다.
  await request<unknown>(getCertificateUpdateEndpoint(certificateId), {
    method: "PUT",
    body,
    token,
    signal,
    errorMessages: {
      400: CERTIFICATE_UPDATE_BAD_REQUEST_MESSAGE,
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
