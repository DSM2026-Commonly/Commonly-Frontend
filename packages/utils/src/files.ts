import { ApiError, request } from "./api";

export const FILE_UPLOAD_ENDPOINT = "/api/files/upload";

export function getFileMappingEndpoint(fileId: number): string {
  return `/api/files/${fileId}/mapping`;
}

export const FILE_UPLOAD_INVALID_RESPONSE_MESSAGE =
  "파일 업로드 응답이 올바르지 않습니다.";
export const FILE_UPLOAD_UNSUPPORTED_TYPE_MESSAGE =
  "지원하지 않는 파일 형식입니다. 제공된 표준 서식(.xlsx)을 사용해 주세요.";
export const FILE_UPLOAD_SIZE_EXCEEDED_MESSAGE =
  "파일 크기가 너무 큽니다. 20MB 이하의 파일만 업로드할 수 있습니다.";
export const FILE_UPLOAD_INVALID_HEADER_MESSAGE =
  "1행에서 헤더를 찾을 수 없습니다. 제공된 표준 서식을 사용해 주세요.";
export const FILE_UPLOAD_UNPROCESSABLE_MESSAGE =
  "파일에 처리할 데이터가 없습니다. 시트와 데이터 행을 확인해 주세요.";
export const FILE_UPLOAD_STORAGE_FAILURE_MESSAGE =
  "파일 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.";

export const FILE_MAPPING_NOT_FOUND_MESSAGE =
  "업로드한 파일을 찾을 수 없습니다. 파일을 다시 업로드해 주세요.";
export const FILE_MAPPING_BAD_REQUEST_MESSAGE =
  "매핑 정보가 올바르지 않습니다. 열 선택을 다시 확인해 주세요.";
export const FILE_MAPPING_CONFLICT_MESSAGE =
  "이미 처리된 파일입니다. 파일을 다시 업로드해 주세요.";
export const FILE_MAPPING_INVALID_RESPONSE_MESSAGE =
  "매핑 확정 응답이 올바르지 않습니다.";

export interface UploadedFileRow {
  rowIndex: number;
  cells: string[];
}

export interface UploadedFile {
  fileId: number;
  fileName: string;
  columns: string[];
  rows: UploadedFileRow[];
}

export interface InvalidHeaderRowDetail {
  expectedHeaderRow: number;
  firstNonEmptyRow: number;
}

export interface FileMapping {
  sourceColumn: string;
  targetField: CertificateTargetFieldId;
}

export interface FileMappingRequest {
  mappings: FileMapping[];
  confirmed: boolean;
}

export interface FileMappingFailedRow {
  rowIndex: number;
  reason: string;
}

export interface FileMappingResult {
  insertedCount: number;
  failedRows: FileMappingFailedRow[];
}

export const CERTIFICATE_TARGET_FIELDS = [
  { id: "name", label: "성명" },
  { id: "birthDate", label: "생년월일" },
  { id: "gender", label: "성별" },
  { id: "jobTitle", label: "직종명" },
  { id: "keyResponsibilities", label: "담당업무" },
  { id: "hireDate", label: "채용일" },
  { id: "expirationDate", label: "만료예정일" },
  { id: "retirementDate", label: "퇴직일" },
  { id: "division", label: "구분" },
  { id: "reason", label: "사유" },
  { id: "employmentType", label: "근무형태" },
  { id: "note", label: "비고" },
] as const;

export type CertificateTargetFieldId =
  (typeof CERTIFICATE_TARGET_FIELDS)[number]["id"];

export interface CertificateTargetField {
  id: CertificateTargetFieldId;
  label: string;
}

function normalizeHeader(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase();
}

/**
 * 엑셀 열 이름이 기준 서식의 헤더와 같으면 자동으로 매핑 초기값을 제안한다.
 * 반환값은 `targetField -> sourceColumn` 형태이며, 매칭되지 않은 필드는 포함되지 않는다.
 */
export function suggestFileMappings(
  columns: readonly string[],
): Partial<Record<CertificateTargetFieldId, string>> {
  const suggestions: Partial<Record<CertificateTargetFieldId, string>> = {};
  const usedColumns = new Set<string>();

  for (const field of CERTIFICATE_TARGET_FIELDS) {
    const matched = columns.find(
      (column) =>
        !usedColumns.has(column) &&
        normalizeHeader(column) === normalizeHeader(field.label),
    );

    if (matched !== undefined) {
      suggestions[field.id] = matched;
      usedColumns.add(matched);
    }
  }

  return suggestions;
}

/** 업로드 응답의 첫 데이터 행을 매핑 결과 기준으로 `targetField -> 셀 값` 으로 변환한다. */
export function getMappedRowValues(
  uploadedFile: Pick<UploadedFile, "columns" | "rows">,
  mappings: readonly FileMapping[],
  rowPosition = 0,
): Partial<Record<CertificateTargetFieldId, string>> {
  const row = uploadedFile.rows[rowPosition];
  const values: Partial<Record<CertificateTargetFieldId, string>> = {};

  if (!row) {
    return values;
  }

  for (const mapping of mappings) {
    const columnIndex = uploadedFile.columns.indexOf(mapping.sourceColumn);

    if (columnIndex >= 0) {
      values[mapping.targetField] = row.cells[columnIndex] ?? "";
    }
  }

  return values;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function normalizeUploadedFile(value: unknown): UploadedFile | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const { fileId, fileName, columns, rows } = value as Record<string, unknown>;

  if (
    typeof fileId !== "number" ||
    !Number.isFinite(fileId) ||
    typeof fileName !== "string" ||
    !isStringArray(columns) ||
    !Array.isArray(rows)
  ) {
    return null;
  }

  const normalizedRows: UploadedFileRow[] = [];

  for (const row of rows) {
    if (!row || typeof row !== "object") {
      return null;
    }

    const { rowIndex, cells } = row as Record<string, unknown>;

    if (typeof rowIndex !== "number" || !isStringArray(cells)) {
      return null;
    }

    normalizedRows.push({ rowIndex, cells });
  }

  return { fileId, fileName, columns, rows: normalizedRows };
}

export interface UploadFileOptions {
  token?: string | null;
  signal?: AbortSignal;
}

export async function uploadFile(
  file: File,
  { token, signal }: UploadFileOptions = {},
): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await request<unknown>(FILE_UPLOAD_ENDPOINT, {
    method: "POST",
    body: formData,
    token,
    signal,
    errorMessages: {
      UNSUPPORTED_FILE_TYPE: FILE_UPLOAD_UNSUPPORTED_TYPE_MESSAGE,
      FILE_SIZE_EXCEEDED: FILE_UPLOAD_SIZE_EXCEEDED_MESSAGE,
      INVALID_HEADER_ROW: FILE_UPLOAD_INVALID_HEADER_MESSAGE,
      UNPROCESSABLE_FILE: FILE_UPLOAD_UNPROCESSABLE_MESSAGE,
      STORAGE_FAILURE: FILE_UPLOAD_STORAGE_FAILURE_MESSAGE,
      400: FILE_UPLOAD_UNSUPPORTED_TYPE_MESSAGE,
      413: FILE_UPLOAD_SIZE_EXCEEDED_MESSAGE,
      422: FILE_UPLOAD_UNPROCESSABLE_MESSAGE,
      502: FILE_UPLOAD_STORAGE_FAILURE_MESSAGE,
    },
  });

  const uploadedFile = normalizeUploadedFile(response);

  if (!uploadedFile) {
    throw new ApiError(201, FILE_UPLOAD_INVALID_RESPONSE_MESSAGE);
  }

  return uploadedFile;
}

/** INVALID_HEADER_ROW 에러의 detail 에서 헤더로 보이는 행 번호를 꺼내 안내 문구를 만든다. */
export function getUploadErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return error instanceof Error && error.message
      ? error.message
      : FILE_UPLOAD_STORAGE_FAILURE_MESSAGE;
  }

  if (error.code === "INVALID_HEADER_ROW") {
    const detail = error.detail as Partial<InvalidHeaderRowDetail> | undefined;

    if (typeof detail?.firstNonEmptyRow === "number") {
      return `${FILE_UPLOAD_INVALID_HEADER_MESSAGE} (헤더로 보이는 행: ${detail.firstNonEmptyRow}행)`;
    }
  }

  return error.message;
}

export interface ConfirmFileMappingOptions extends UploadFileOptions {
  confirmed?: boolean;
}

function normalizeFileMappingResult(value: unknown): FileMappingResult | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const { insertedCount, failedRows } = value as Record<string, unknown>;

  if (typeof insertedCount !== "number") {
    return null;
  }

  const normalizedFailedRows: FileMappingFailedRow[] = [];

  for (const failedRow of Array.isArray(failedRows) ? failedRows : []) {
    if (!failedRow || typeof failedRow !== "object") {
      return null;
    }

    const { rowIndex, reason } = failedRow as Record<string, unknown>;

    normalizedFailedRows.push({
      rowIndex: typeof rowIndex === "number" ? rowIndex : 0,
      reason: typeof reason === "string" ? reason : "",
    });
  }

  return { insertedCount, failedRows: normalizedFailedRows };
}

export async function confirmFileMapping(
  fileId: number,
  mappings: readonly FileMapping[],
  { confirmed = true, token, signal }: ConfirmFileMappingOptions = {},
): Promise<FileMappingResult> {
  const body: FileMappingRequest = { mappings: [...mappings], confirmed };

  const response = await request<unknown>(getFileMappingEndpoint(fileId), {
    method: "PUT",
    body,
    token,
    signal,
    errorMessages: {
      400: FILE_MAPPING_BAD_REQUEST_MESSAGE,
      404: FILE_MAPPING_NOT_FOUND_MESSAGE,
      409: FILE_MAPPING_CONFLICT_MESSAGE,
    },
  });

  const result = normalizeFileMappingResult(response);

  if (!result) {
    throw new ApiError(200, FILE_MAPPING_INVALID_RESPONSE_MESSAGE);
  }

  return result;
}
