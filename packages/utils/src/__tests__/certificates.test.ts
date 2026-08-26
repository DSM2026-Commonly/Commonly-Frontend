import { describe, expect, test } from "bun:test";
import { ApiError } from "../api";
import {
  HUMAN_CERTIFICATES_INVALID_RESPONSE_MESSAGE,
  fetchHumanCertificates,
  getCertificateUpdateEndpoint,
  getHumanCertificatesEndpoint,
  updateCertificate,
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

const updateRequest = {
  name: "홍길동",
  birth_date: "1990-01-01",
  gender: "M" as const,
  job_title: "사무원",
  key_responsibilities: "행정지원",
  hire_date: "2024-03-01",
  expiration_date: "2025-02-28",
  retirement_date: "2025-02-28",
  division: "채용",
  reason: "신규채용",
  employment_type: "기간제",
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

describe("updateCertificate", () => {
  test("PUTs the snake_case body to the certificate endpoint", async () => {
    mockFetch(200, { insertedCount: 0, failedRows: [] }, (url, init) => {
      expect(url).toBe(getCertificateUpdateEndpoint(7));
      expect(url).toBe("/api/certificates/7");
      expect(init?.method).toBe("PUT");
      const headers = init?.headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("application/json");
      expect(headers.Authorization).toBe("Bearer token-1");
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(body).toEqual(updateRequest);
      expect(Object.keys(body).sort()).toEqual([
        "birth_date",
        "division",
        "employment_type",
        "expiration_date",
        "gender",
        "hire_date",
        "job_title",
        "key_responsibilities",
        "name",
        "note",
        "reason",
        "retirement_date",
      ]);
    });

    await updateCertificate(7, updateRequest, { token: "token-1" });
  });

  test("resolves on 200 even with the spec's copy-paste body", async () => {
    mockFetch(200, { insertedCount: 0, failedRows: [{ rowIndex: 0, reason: "x" }] });
    await updateCertificate(7, updateRequest);
  });

  test("resolves on 204 with an empty body", async () => {
    mockFetch(204, undefined);
    await updateCertificate(7, updateRequest);
  });

  test("maps error statuses to Korean messages", async () => {
    const cases = [
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
});
