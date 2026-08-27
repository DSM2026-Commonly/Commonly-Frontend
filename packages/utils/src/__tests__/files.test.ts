import { describe, expect, test } from "bun:test";
import { ApiError } from "../api";
import {
  CERTIFICATE_TARGET_FIELDS,
  FILE_UPLOAD_ENDPOINT,
  confirmFileMapping,
  getFileMappingEndpoint,
  getMappedRowValues,
  getUploadErrorMessage,
  suggestFileMappings,
  uploadFile,
  type FileMapping,
} from "../files";

const columns = [
  "성명",
  "생년월일",
  "성별",
  "직종명",
  "담당업무",
  "채용일",
  "만료예정일",
  "퇴직일",
  "구분",
  "사유",
  "근무형태",
  "비고",
];

const uploadResponse = {
  fileId: 1,
  fileName: "기간제_근로자_관리서식.xlsx",
  columns,
  rows: [
    { rowIndex: 2, cells: ["홍길동", "1985-03-12", "남", "사무원", "행정지원", "2024-03-01", "2025-02-28", "", "신규", "", "전일제", ""] },
    { rowIndex: 3, cells: ["김철수", "1990-07-01", "여", "관리원", "시설관리", "2023-01-02", "2023-12-31", "2023-12-31", "재계약", "계약만료", "시간제", "비고"] },
  ],
};

function mockFetch(
  status: number,
  body: unknown,
  assertInit?: (url: string, init?: RequestInit) => void,
) {
  globalThis.fetch = (async (url: unknown, init?: RequestInit) => {
    assertInit?.(String(url), init);
    return new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
}

describe("uploadFile", () => {
  test("sends multipart form-data with a `file` part and returns parsed sheet", async () => {
    const file = new File(["dummy"], "서식.xlsx");
    mockFetch(201, uploadResponse, (url, init) => {
      expect(url).toBe(FILE_UPLOAD_ENDPOINT);
      expect(init?.method).toBe("POST");
      expect(init?.body).toBeInstanceOf(FormData);
      const formData = init?.body as FormData;
      expect(formData.get("file")).toBeInstanceOf(File);
      const headers = init?.headers as Record<string, string>;
      expect(headers["Content-Type"]).toBeUndefined();
      expect(headers.Authorization).toBe("Bearer token-1");
    });

    expect(await uploadFile(file, { token: "token-1" })).toEqual(uploadResponse);
  });

  test("maps error codes to messages and keeps detail", async () => {
    mockFetch(422, {
      code: "INVALID_HEADER_ROW",
      message: "1행에서 헤더를 찾을 수 없습니다.",
      detail: { expectedHeaderRow: 1, firstNonEmptyRow: 3 },
    });

    const error = await uploadFile(new File([""], "a.xlsx")).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(422);
    expect((error as ApiError).code).toBe("INVALID_HEADER_ROW");
    expect(getUploadErrorMessage(error)).toContain("3행");
  });

  test("falls back to status mapping when body has no code", async () => {
    mockFetch(413, undefined);
    const error = await uploadFile(new File([""], "a.xlsx")).catch((e: unknown) => e);
    expect((error as ApiError).message).toContain("파일 크기");
  });

  test("rejects malformed 201 body", async () => {
    mockFetch(201, { fileId: "1", columns: [], rows: [] });
    const error = await uploadFile(new File([""], "a.xlsx")).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).message).toBe("파일 업로드 응답이 올바르지 않습니다.");
  });
});

describe("confirmFileMapping", () => {
  const mappings: FileMapping[] = CERTIFICATE_TARGET_FIELDS.map((field) => ({
    sourceColumn: field.label,
    targetField: field.id,
  }));

  test("PUTs mappings with confirmed=true and returns result", async () => {
    mockFetch(200, { insertedCount: 2, failedRows: [] }, (url, init) => {
      expect(url).toBe(getFileMappingEndpoint(1));
      expect(init?.method).toBe("PUT");
      expect(JSON.parse(String(init?.body))).toEqual({ mappings, confirmed: true });
    });

    expect(await confirmFileMapping(1, mappings)).toEqual({
      insertedCount: 2,
      failedRows: [],
    });
  });

  test("404 / 400 / 409 map to messages", async () => {
    for (const [status, fragment] of [
      [404, "찾을 수 없습니다"],
      [400, "매핑 정보"],
      [409, "이미 처리된"],
    ] as const) {
      mockFetch(status, undefined);
      const error = await confirmFileMapping(1, mappings).catch((e: unknown) => e);
      expect((error as ApiError).status).toBe(status);
      expect((error as ApiError).message).toContain(fragment);
    }
  });
});

describe("mapping helpers", () => {
  test("suggestFileMappings matches standard headers ignoring whitespace", () => {
    const suggestions = suggestFileMappings(["성 명", "생년월일", "기타"]);
    expect(suggestions).toEqual({ name: "성 명", birthDate: "생년월일" });
  });

  test("getMappedRowValues reads first row by mapped columns", () => {
    const values = getMappedRowValues(uploadResponse, [
      { sourceColumn: "성명", targetField: "name" },
      { sourceColumn: "비고", targetField: "note" },
      { sourceColumn: "없는열", targetField: "reason" },
    ]);
    expect(values).toEqual({ name: "홍길동", note: "" });
  });
});
