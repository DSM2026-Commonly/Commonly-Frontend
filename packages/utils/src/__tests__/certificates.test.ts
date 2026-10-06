import { describe, expect, test } from "bun:test";
import { ApiError, NETWORK_ERROR_MESSAGE } from "../api";
import {
  CERTIFICATES_ENDPOINT,
  CERTIFICATE_DETAIL_INVALID_RESPONSE_MESSAGE,
  CERTIFICATE_DETAIL_NOT_FOUND_MESSAGE,
  fetchCertificateDetail,
  getCertificateDetailEndpoint,
  CERTIFICATE_CREATE_ENDPOINT,
  CERTIFICATE_CREATE_BAD_REQUEST_MESSAGE,
  CERTIFICATE_CREATE_HUMAN_NOT_FOUND_MESSAGE,
  createCertificate,
  CERTIFICATE_ISSUE_INVALID_RESPONSE_MESSAGE,
  CERTIFICATE_LIMIT_EXCEEDED_MESSAGE,
  CERTIFICATE_PREVIEW_ENDPOINT,
  CERTIFICATE_PREVIEW_INVALID_RESPONSE_MESSAGE,
  CERTIFICATE_SELF_ENDPOINT,
  CERTIFICATE_SELF_ISSUE_FORBIDDEN_MESSAGE,
  CERTIFICATE_SELF_ISSUE_UNAUTHORIZED_MESSAGE,
  CERTIFICATE_SELF_PREVIEW_ENDPOINT,
  HUMAN_CERTIFICATES_INVALID_RESPONSE_MESSAGE,
  HUMAN_DELETE_HAS_CAREERS_MESSAGE,
  assertHumanDeletable,
  PETITIONER_HUMAN_NOT_MATCHED_MESSAGE,
  downloadCertificate,
  fetchHumanCertificates,
  fetchMyCertificates,
  getCertificateDownloadEndpoint,
  getCertificateUpdateEndpoint,
  getHumanCertificatesEndpoint,
  issueCertificate,
  issueSelfCertificate,
  previewCertificate,
  previewSelfCertificate,
  updateCertificate,
} from "../certificates";

const humanCertificate = {
  certificateId: 10,
  division: "채용",
  department: "민원과",
  employmentType: "기간제",
  jobTitle: "사무원",
  keyResponsibilities: "행정지원",
  hireDate: "2024-03-01",
  retirementDate: "2025-02-28",
  expirationDate: "2025-02-28",
  reason: "신규채용",
  note: "",
};

const issueRequest = {
  humanId: 3,
  certificateIds: [10, 11],
  purpose: "은행 제출용",
  otherMatters: "기타사항 없음",
};

const issuedResponse = {
  certificateId: 5,
  documentNo: "유성구-2026-000001",
  downloadUrl: "/api/certificates/5/download",
};

const updateRequest = {
  name: "홍길동",
  birthDate: "1990-01-01",
  // 경력 수정 API 의 성별은 enum 이름이다. M/F 를 보내면 400 이다.
  gender: "MALE" as const,
  jobTitle: "사무원",
  keyResponsibilities: "행정지원",
  hireDate: "2024-03-01",
  expirationDate: "2025-02-28",
  retirementDate: "2025-02-28",
  division: "채용",
  department: "민원과",
  reason: "신규채용",
  employmentType: "기간제",
  note: "",
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

const PDF_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

function mockPdfFetch(assertInit?: (url: string, init?: RequestInit) => void) {
  globalThis.fetch = (async (url: unknown, init?: RequestInit) => {
    assertInit?.(String(url), init);
    return new Response(new Blob([PDF_BYTES], { type: "application/pdf" }), {
      status: 200,
      headers: { "Content-Disposition": "inline" },
    });
  }) as typeof fetch;
}

describe("fetchCertificateDetail", () => {
  const detailResponse = {
    certificateId: 5,
    documentNo: "유성구-2026-000001",
    issuedAt: "2026-09-05T14:03:11",
    purpose: "은행 제출용",
    otherMatters: "",
    human: {
      humanId: 3,
      name: "홍길동",
      birthDate: "1990-01-01",
      gender: "M",
      address: "대전 유성구",
    },
    totalMonths: 12,
    totalDays: 0,
    items: [humanCertificate],
  };

  test("GETs the issued certificate with the bearer token", async () => {
    mockFetch(200, detailResponse, (url, init) => {
      expect(url).toBe(getCertificateDetailEndpoint(5));
      expect(url).toBe("/api/certificates/5");
      expect(init?.method).toBe("GET");
      expect(new Headers(init?.headers).get("Authorization")).toBe(
        "Bearer token-1",
      );
    });

    expect(await fetchCertificateDetail(5, { token: "token-1" })).toEqual({
      ...detailResponse,
      items: [humanCertificate],
    });
  });

  test("keeps the response usable when optional fields are missing", async () => {
    mockFetch(200, { certificateId: 5, documentNo: "유성구-2026-000001" });

    expect(await fetchCertificateDetail(5)).toEqual({
      certificateId: 5,
      documentNo: "유성구-2026-000001",
      issuedAt: "",
      purpose: "",
      otherMatters: "",
      human: null,
      totalMonths: 0,
      totalDays: 0,
      items: [],
    });
  });

  test("rejects a response without the identifying fields", async () => {
    mockFetch(200, { certificateId: 5 });

    await expect(fetchCertificateDetail(5)).rejects.toThrow(
      CERTIFICATE_DETAIL_INVALID_RESPONSE_MESSAGE,
    );
  });

  test("rejects a blank document number", async () => {
    mockFetch(200, { certificateId: 5, documentNo: "  " });

    await expect(fetchCertificateDetail(5)).rejects.toThrow(
      CERTIFICATE_DETAIL_INVALID_RESPONSE_MESSAGE,
    );
  });

  test("maps 404 to the not found message", async () => {
    mockFetch(404, undefined);

    await expect(fetchCertificateDetail(5)).rejects.toThrow(
      CERTIFICATE_DETAIL_NOT_FOUND_MESSAGE,
    );
  });
});

describe("assertHumanDeletable", () => {
  test("passes when the human has no career rows", async () => {
    mockFetch(200, [], (url) => {
      expect(url).toBe(getHumanCertificatesEndpoint(3));
    });

    await expect(assertHumanDeletable(3, { token: "token-1" })).resolves.toBeUndefined();
  });

  test("refuses when the human has career rows", async () => {
    mockFetch(200, [humanCertificate]);

    await expect(assertHumanDeletable(3)).rejects.toThrow(
      HUMAN_DELETE_HAS_CAREERS_MESSAGE,
    );
  });

  // 채용일이 없는 행처럼 화면에 못 그리는 행도 경력이므로 삭제를 막아야 한다.
  test("counts rows the screen cannot render", async () => {
    mockFetch(200, [{ ...humanCertificate, hireDate: null }]);

    await expect(assertHumanDeletable(3)).rejects.toThrow(
      HUMAN_DELETE_HAS_CAREERS_MESSAGE,
    );
  });

  test("rejects a non-array response", async () => {
    mockFetch(200, { content: [] });

    await expect(assertHumanDeletable(3)).rejects.toMatchObject({
      message: HUMAN_CERTIFICATES_INVALID_RESPONSE_MESSAGE,
    });
  });
});

describe("fetchHumanCertificates", () => {
  test("GETs the human's certificates with auth header", async () => {
    mockFetch(200, [humanCertificate], (url, init) => {
      expect(url).toBe(getHumanCertificatesEndpoint(3));
      expect(url).toBe("/api/humans/3/certificates");
      expect(init?.method).toBe("GET");
      expect(init?.body).toBeUndefined();
      const headers = init?.headers as Record<string, string>;
      expect(headers.Authorization).toBe("Bearer token-1");
    });

    expect(await fetchHumanCertificates(3, { token: "token-1" })).toEqual([
      humanCertificate,
    ]);
  });

  test("returns an empty list for 200 + []", async () => {
    mockFetch(200, []);
    expect(await fetchHumanCertificates(3)).toEqual([]);
  });

  test("skips malformed rows instead of failing the whole list", async () => {
    mockFetch(200, [
      humanCertificate,
      { ...humanCertificate, certificateId: "11" },
      { ...humanCertificate, hireDate: null },
      { ...humanCertificate, note: 5 },
      null,
    ]);

    expect(await fetchHumanCertificates(3)).toEqual([humanCertificate]);
  });

  test("normalizes null or omitted optional fields to empty strings", async () => {
    mockFetch(200, [
      {
        certificateId: 12,
        division: null,
        employmentType: "기간제",
        keyResponsibilities: "행정지원",
        hireDate: "2024-03-01",
        retirementDate: null,
        expirationDate: "2025-02-28",
        reason: null,
      },
    ]);

    expect(await fetchHumanCertificates(3)).toEqual([
      {
        certificateId: 12,
        division: "",
        department: "",
        employmentType: "기간제",
        jobTitle: "",
        keyResponsibilities: "행정지원",
        hireDate: "2024-03-01",
        retirementDate: "",
        expirationDate: "2025-02-28",
        reason: "",
        note: "",
      },
    ]);
  });

  test("rejects non-array 200 bodies", async () => {
    for (const body of [undefined, {}, "oops"]) {
      mockFetch(200, body);
      const error = await fetchHumanCertificates(3).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(200);
      expect((error as ApiError).message).toBe(
        HUMAN_CERTIFICATES_INVALID_RESPONSE_MESSAGE,
      );
    }
  });

  test("maps error statuses to Korean messages", async () => {
    const cases = [
      [400, "대상자 정보가 올바르지 않습니다"],
      [401, "로그인이 만료되었습니다"],
      [404, "인적사항을 찾을 수 없습니다"],
      [500, "일시적인 오류"],
    ] as const;

    for (const [status, message] of cases) {
      mockFetch(status, undefined);
      const error = await fetchHumanCertificates(3).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(status);
      expect((error as ApiError).message).toContain(message);
    }
  });
});

describe("issueCertificate", () => {
  test("POSTs the issue request with humanId/certificateIds keys", async () => {
    mockFetch(201, issuedResponse, (url, init) => {
      expect(url).toBe(CERTIFICATES_ENDPOINT);
      expect(init?.method).toBe("POST");
      const headers = init?.headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("application/json");
      expect(headers.Authorization).toBe("Bearer token-1");
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(body).toEqual(issueRequest);
      expect(Object.keys(body).sort()).toEqual([
        "certificateIds",
        "humanId",
        "otherMatters",
        "purpose",
      ]);
    });

    expect(await issueCertificate(issueRequest, { token: "token-1" })).toEqual(
      issuedResponse,
    );
  });

  test("rejects malformed 201 bodies", async () => {
    for (const body of [
      undefined,
      {},
      { ...issuedResponse, certificateId: "5" },
    ]) {
      mockFetch(201, body);
      const error = await issueCertificate(issueRequest).catch(
        (e: unknown) => e,
      );
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(201);
      expect((error as ApiError).message).toBe(
        CERTIFICATE_ISSUE_INVALID_RESPONSE_MESSAGE,
      );
    }
  });

  test("maps error statuses to Korean messages", async () => {
    const cases = [
      [401, "로그인이 만료되었습니다"],
      [404, "찾을 수 없습니다"],
      [409, "다시 시도"],
      [500, "일시적인 오류"],
    ] as const;

    for (const [status, message] of cases) {
      mockFetch(status, undefined);
      const error = await issueCertificate(issueRequest).catch(
        (e: unknown) => e,
      );
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(status);
      expect((error as ApiError).message).toContain(message);
    }
  });
});

describe("issueSelfCertificate", () => {
  const selfRequest = {
    purpose: "은행 제출용",
    otherMatters: "",
  };

  test("POSTs purpose/otherMatters without certificateIds for 전체 발급", async () => {
    mockFetch(201, issuedResponse, (url, init) => {
      expect(url).toBe(CERTIFICATE_SELF_ENDPOINT);
      expect(url).toBe("/api/certificates/self");
      expect(init?.method).toBe("POST");
      const headers = init?.headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("application/json");
      expect(headers.Authorization).toBe("Bearer token-1");
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(body).toEqual(selfRequest);
      expect(Object.keys(body).sort()).toEqual(["otherMatters", "purpose"]);
    });

    expect(
      await issueSelfCertificate(selfRequest, { token: "token-1" }),
    ).toEqual(issuedResponse);
  });

  test("sends the chosen certificateIds for 선택 발급", async () => {
    mockFetch(201, issuedResponse, (_url, init) => {
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(body).toEqual({ ...selfRequest, certificateIds: [10, 12] });
    });

    expect(
      await issueSelfCertificate({ ...selfRequest, certificateIds: [10, 12] }),
    ).toEqual(issuedResponse);
  });

  test("rejects malformed 201 bodies", async () => {
    for (const body of [undefined, {}, { ...issuedResponse, documentNo: 1 }]) {
      mockFetch(201, body);
      const error = await issueSelfCertificate(selfRequest).catch(
        (e: unknown) => e,
      );
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(201);
      expect((error as ApiError).message).toBe(
        CERTIFICATE_ISSUE_INVALID_RESPONSE_MESSAGE,
      );
    }
  });

  test("maps error statuses to Korean messages", async () => {
    const cases = [
      // 전체 발급인데 재직 이력이 10건을 넘으면 400(CERTIFICATE_LIMIT_EXCEEDED)이다.
      [400, CERTIFICATE_LIMIT_EXCEEDED_MESSAGE],
      // 본인 발급이 닫혀 있으면 본문 없는 401/403 이 온다. "다시 로그인" 안내를 쓰지 않는다.
      [401, CERTIFICATE_SELF_ISSUE_UNAUTHORIZED_MESSAGE],
      [403, CERTIFICATE_SELF_ISSUE_FORBIDDEN_MESSAGE],
      [500, "일시적인 오류"],
    ] as const;

    for (const [status, message] of cases) {
      mockFetch(status, undefined);
      const error = await issueSelfCertificate(selfRequest).catch(
        (e: unknown) => e,
      );
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(status);
      expect((error as ApiError).message).toContain(message);
    }
  });

  test("keeps the backend message for 404 (human mismatch vs. missing career)", async () => {
    // 404 는 두 갈래라 상태 코드로 문구를 고르지 않는다.
    for (const message of [
      "계정 정보와 일치하는 인적사항이 없습니다.",
      "해당 경력사항을 찾을 수 없습니다.",
    ]) {
      mockFetch(404, { status: 404, message });

      await expect(issueSelfCertificate(selfRequest)).rejects.toMatchObject({
        status: 404,
        message,
      });
    }
  });
});

describe("fetchMyCertificates", () => {
  test("GETs the petitioner's own certificates with the bearer token", async () => {
    mockFetch(200, [humanCertificate], (url, init) => {
      expect(url).toBe(CERTIFICATE_SELF_ENDPOINT);
      expect(init?.method).toBe("GET");
      expect(init?.body).toBeUndefined();
      const headers = init?.headers as Record<string, string>;
      expect(headers.Authorization).toBe("Bearer token-1");
    });

    expect(await fetchMyCertificates({ token: "token-1" })).toEqual([
      humanCertificate,
    ]);
  });

  test("normalizes rows the same way as fetchHumanCertificates", async () => {
    mockFetch(200, [
      { ...humanCertificate, retirementDate: null, note: null },
      { ...humanCertificate, certificateId: "11" },
    ]);

    expect(await fetchMyCertificates()).toEqual([
      { ...humanCertificate, retirementDate: "", note: "" },
    ]);
  });

  test("rejects non-array 200 bodies", async () => {
    mockFetch(200, {});

    await expect(fetchMyCertificates()).rejects.toMatchObject({
      status: 200,
      message: HUMAN_CERTIFICATES_INVALID_RESPONSE_MESSAGE,
    });
  });

  test("maps the closed self-issue gate and unmatched account to messages", async () => {
    const cases = [
      [401, CERTIFICATE_SELF_ISSUE_UNAUTHORIZED_MESSAGE],
      [403, CERTIFICATE_SELF_ISSUE_FORBIDDEN_MESSAGE],
      [404, PETITIONER_HUMAN_NOT_MATCHED_MESSAGE],
    ] as const;

    for (const [status, message] of cases) {
      mockFetch(status, undefined);

      await expect(fetchMyCertificates()).rejects.toMatchObject({
        status,
        message,
      });
    }
  });
});

describe("previewCertificate", () => {
  test("POSTs the same body as issuing and returns the PDF blob", async () => {
    mockPdfFetch((url, init) => {
      expect(url).toBe(CERTIFICATE_PREVIEW_ENDPOINT);
      expect(url).toBe("/api/certificates/preview");
      expect(init?.method).toBe("POST");
      const headers = init?.headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("application/json");
      expect(headers.Authorization).toBe("Bearer token-1");
      expect(JSON.parse(String(init?.body))).toEqual(issueRequest);
    });

    const blob = await previewCertificate(issueRequest, { token: "token-1" });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBe(PDF_BYTES.length);
  });

  test("rejects a 200 that is not a PDF so the caller can fall back", async () => {
    for (const response of [
      new Response("<!doctype html>", {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }),
      new Response(new Blob([], { type: "application/pdf" }), { status: 200 }),
    ]) {
      globalThis.fetch = (async () => response) as unknown as typeof fetch;

      await expect(previewCertificate(issueRequest)).rejects.toMatchObject({
        status: 200,
        message: CERTIFICATE_PREVIEW_INVALID_RESPONSE_MESSAGE,
      });
    }
  });

  test("surfaces the size validation message when more than 10 ids are sent", async () => {
    mockFetch(400, {
      status: 400,
      error: { certificateIds: "크기가 0에서 10 사이여야 합니다" },
    });

    await expect(
      previewCertificate({
        ...issueRequest,
        certificateIds: Array.from({ length: 11 }, (_, index) => index + 1),
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: "크기가 0에서 10 사이여야 합니다",
    });
  });

  test("maps error statuses to Korean messages", async () => {
    const cases = [
      [401, "로그인이 만료되었습니다"],
      [404, "찾을 수 없습니다"],
      [500, "일시적인 오류"],
    ] as const;

    for (const [status, message] of cases) {
      mockFetch(status, undefined);
      const error = await previewCertificate(issueRequest).catch(
        (e: unknown) => e,
      );
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(status);
      expect((error as ApiError).message).toContain(message);
    }
  });
});

describe("previewSelfCertificate", () => {
  test("POSTs the self body to the self preview endpoint", async () => {
    mockPdfFetch((url, init) => {
      expect(url).toBe(CERTIFICATE_SELF_PREVIEW_ENDPOINT);
      expect(url).toBe("/api/certificates/self/preview");
      expect(init?.method).toBe("POST");
      expect(JSON.parse(String(init?.body))).toEqual({
        purpose: "은행 제출용",
        otherMatters: "",
        certificateIds: [10],
      });
    });

    const blob = await previewSelfCertificate({
      purpose: "은행 제출용",
      otherMatters: "",
      certificateIds: [10],
    });

    expect(blob.type).toBe("application/pdf");
  });

  test("uses the same messages as self issuing", async () => {
    const cases = [
      [400, CERTIFICATE_LIMIT_EXCEEDED_MESSAGE],
      [401, CERTIFICATE_SELF_ISSUE_UNAUTHORIZED_MESSAGE],
      [403, CERTIFICATE_SELF_ISSUE_FORBIDDEN_MESSAGE],
    ] as const;

    for (const [status, message] of cases) {
      mockFetch(status, undefined);

      await expect(
        previewSelfCertificate({ purpose: "은행 제출용", otherMatters: "" }),
      ).rejects.toMatchObject({ status, message });
    }
  });
});

describe("updateCertificate", () => {
  test("PUTs the camelCase body to the certificate endpoint", async () => {
    mockFetch(204, undefined, (url, init) => {
      expect(url).toBe(getCertificateUpdateEndpoint(7));
      expect(url).toBe("/api/certificates/7");
      expect(init?.method).toBe("PUT");
      const headers = init?.headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("application/json");
      expect(headers.Authorization).toBe("Bearer token-1");
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(body).toEqual(updateRequest);
      expect(Object.keys(body).sort()).toEqual([
        "birthDate",
        "department",
        "division",
        "employmentType",
        "expirationDate",
        "gender",
        "hireDate",
        "jobTitle",
        "keyResponsibilities",
        "name",
        "note",
        "reason",
        "retirementDate",
      ]);
    });

    await updateCertificate(7, updateRequest, { token: "token-1" });
  });

  test("resolves on 200 with an unexpected body (tolerated)", async () => {
    mockFetch(200, { insertedCount: 0, failedRows: [{ rowIndex: 0, reason: "x" }] });
    await updateCertificate(7, updateRequest);
  });

  test("resolves on 204 with an empty body", async () => {
    mockFetch(204, undefined);
    await updateCertificate(7, updateRequest);
  });

  test("sends null for unknown codes and missing dates", async () => {
    // 구분/근무형태는 허용값 검증, 날짜는 LocalDate 역직렬화에 걸려 빈 문자열이면 400 이다.
    mockFetch(204, undefined, (_url, init) => {
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(body.division).toBeNull();
      expect(body.employmentType).toBeNull();
      expect(body.expirationDate).toBeNull();
      expect(body.retirementDate).toBeNull();
      expect(body.gender).toBe("FEMALE");
    });

    await updateCertificate(7, {
      ...updateRequest,
      gender: "FEMALE",
      division: null,
      employmentType: null,
      expirationDate: null,
      retirementDate: null,
    });
  });

  test("maps error statuses to Korean messages", async () => {
    const cases = [
      [400, "입력값이 올바르지 않습니다"],
      [401, "로그인이 만료되었습니다"],
      [404, "찾을 수 없습니다"],
      [500, "일시적인 오류"],
    ] as const;

    for (const [status, message] of cases) {
      mockFetch(status, undefined);
      const error = await updateCertificate(7, updateRequest).catch(
        (e: unknown) => e,
      );
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(status);
      expect((error as ApiError).message).toContain(message);
    }
  });

  test("surfaces the backend field message on a validation 400", async () => {
    mockFetch(400, {
      status: 400,
      error: { gender: "널이어서는 안됩니다" },
    });

    const error = await updateCertificate(7, updateRequest).catch(
      (e: unknown) => e,
    );

    expect((error as ApiError).message).toBe("널이어서는 안됩니다");
    expect((error as ApiError).fieldErrors).toEqual({
      gender: "널이어서는 안됩니다",
    });
  });
});

describe("downloadCertificate", () => {
  test("GETs the download endpoint and returns the PDF blob", async () => {
    let requestedUrl = "";
    let authHeader = "";
    globalThis.fetch = (async (url: unknown, init?: RequestInit) => {
      requestedUrl = String(url);
      const headers = (init?.headers ?? {}) as Record<string, string>;
      authHeader = headers.Authorization;
      return new Response(
        new Blob([new Uint8Array([0x25, 0x50, 0x44, 0x46])], {
          type: "application/pdf",
        }),
        { status: 200 },
      );
    }) as typeof fetch;

    const blob = await downloadCertificate(5, { token: "token-1" });

    expect(requestedUrl).toBe(getCertificateDownloadEndpoint(5));
    expect(requestedUrl).toBe("/api/certificates/5/download");
    expect(authHeader).toBe("Bearer token-1");
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBe(4);
  });

  test("maps JSON error bodies to Korean messages", async () => {
    const cases = [
      [401, "로그인이 만료되었습니다"],
      [403, "권한이 없습니다"],
      [404, "찾을 수 없습니다"],
      [500, "일시적인 오류"],
    ] as const;

    for (const [status, message] of cases) {
      mockFetch(status, undefined);
      const error = await downloadCertificate(5).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(status);
      expect((error as ApiError).message).toContain(message);
    }
  });

  test("wraps network failures in ApiError(0)", async () => {
    globalThis.fetch = (async () => {
      throw new TypeError("fetch failed");
    }) as typeof fetch;

    const error = await downloadCertificate(5).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(0);
    expect((error as ApiError).message).toBe(NETWORK_ERROR_MESSAGE);
  });
});

describe("createCertificate", () => {
  // 백엔드 CertificateCreateRequest 와 같은 모양. 성명/생년월일/성별은 humanId 로 대신한다.
  const createRequest = {
    humanId: 3,
    jobTitle: "주무관",
    keyResponsibilities: "민원 응대",
    hireDate: "2020-03-01",
    expirationDate: null,
    retirementDate: "2021-02-28",
    division: null,
    department: "총무과",
    reason: "계약 만료",
    employmentType: null,
    note: "",
  };

  test("POSTs the body to /api/certificates/create and returns certificateId", async () => {
    mockFetch(201, { certificateId: 42 }, (url, init) => {
      expect(url).toBe(CERTIFICATE_CREATE_ENDPOINT);
      expect(url).toBe("/api/certificates/create");
      expect(init?.method).toBe("POST");
      const headers = init?.headers as Record<string, string>;
      expect(headers.Authorization).toBe("Bearer token-1");

      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(body).toEqual(createRequest);
      // 구분/근무형태는 빈 문자열이면 백엔드 허용값 검증에 걸린다. null 로 가야 한다.
      expect(body.division).toBeNull();
      expect(body.employmentType).toBeNull();
      // 근무부서는 division 이 아니라 department 다.
      expect(body.department).toBe("총무과");
      expect(body).not.toHaveProperty("name");
      expect(body).not.toHaveProperty("birthDate");
      expect(body).not.toHaveProperty("gender");
    });

    await expect(
      createCertificate(createRequest, { token: "token-1" }),
    ).resolves.toEqual({ certificateId: 42 });
  });

  test("resolves with null certificateId when the 201 body has none", async () => {
    // 201 은 이미 저장된 뒤라 본문이 어긋나도 오류로 돌리지 않는다(재시도하면 중복 등록).
    for (const body of [undefined, {}, { certificateId: "42" }, { certificateId: 0 }]) {
      mockFetch(201, body);
      await expect(createCertificate(createRequest)).resolves.toEqual({
        certificateId: null,
      });
    }
  });

  test("maps 400 / 404 to messages", async () => {
    for (const [status, body, message] of [
      // 검증 실패 400 은 {error: {field: message}} 형식이라 최상위 message 가 없다.
      // 어느 칸이 왜 틀렸는지 알려주므로 뭉뚱그린 400 문구보다 이 문구를 먼저 쓴다.
      [
        400,
        { status: 400, error: { divisionValid: "구분 값은 채용/전보/해지/퇴직 중 하나여야 합니다." } },
        "구분 값은 채용/전보/해지/퇴직 중 하나여야 합니다.",
      ],
      // 검증이 아닌 400 은 매핑해 둔 문구로 떨어진다.
      [400, { status: 400 }, CERTIFICATE_CREATE_BAD_REQUEST_MESSAGE],
      [
        404,
        { status: 404, message: "해당 인적사항을 찾을 수 없습니다." },
        CERTIFICATE_CREATE_HUMAN_NOT_FOUND_MESSAGE,
      ],
    ] as const) {
      mockFetch(status, body);

      await expect(createCertificate(createRequest)).rejects.toMatchObject({
        status,
        message,
      });
    }
  });
});
