import { describe, expect, test } from "bun:test";
import { ApiError, NETWORK_ERROR_MESSAGE } from "../api";
import {
  CERTIFICATES_ENDPOINT,
  CERTIFICATE_ISSUE_INVALID_RESPONSE_MESSAGE,
  HUMAN_CERTIFICATES_INVALID_RESPONSE_MESSAGE,
  downloadCertificate,
  fetchHumanCertificates,
  getCertificateDownloadEndpoint,
  getHumanCertificatesEndpoint,
  issueCertificate,
} from "../certificates";

const humanCertificate = {
  certificateId: 10,
  division: "채용",
  employmentType: "기간제",
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

describe("fetchHumanCertificates", () => {
  test("GETs the human's certificates with auth header", async () => {
    mockFetch(200, [humanCertificate], (url, init) => {
      expect(url).toBe(getHumanCertificatesEndpoint(3));
      expect(url).toBe("/api/certificates/3");
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
      null,
    ]);

    expect(await fetchHumanCertificates(3)).toEqual([humanCertificate]);
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
