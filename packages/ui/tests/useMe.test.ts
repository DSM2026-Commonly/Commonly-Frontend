import { afterEach, describe, expect, test } from "bun:test";
import { loadMe } from "../src/hooks/useMe";

const originalFetch = globalThis.fetch;
const ME_BODY = { userId: 1, accountId: "staff01", name: "홍길동" };

// 응답을 차례로 돌려주고 호출 횟수를 센다. 캐시가 토큰 단위라 테스트마다 다른 토큰을 쓴다.
function mockFetch(responses: Array<() => Response>) {
  let calls = 0;

  globalThis.fetch = (async () => {
    const respond = responses[Math.min(calls, responses.length - 1)];
    calls += 1;
    return respond();
  }) as unknown as typeof fetch;

  return () => calls;
}

function createToken(subject: string, jti: string): string {
  const payload = btoa(JSON.stringify({ sub: subject, jti }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `header.${payload}.signature`;
}

const okResponse = () =>
  new Response(JSON.stringify(ME_BODY), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
const serverErrorResponse = () => new Response("", { status: 500 });

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("loadMe", () => {
  test("shares one request per token", async () => {
    const getCalls = mockFetch([okResponse]);

    const [first, second] = await Promise.all([
      loadMe("token-shared"),
      loadMe("token-shared"),
    ]);

    expect(first?.name).toBe("홍길동");
    expect(second).toBe(first);
    expect(getCalls()).toBe(1);
  });

  test("does not refetch a recent failure on a plain load", async () => {
    const getCalls = mockFetch([serverErrorResponse, okResponse]);

    expect(await loadMe("token-cooldown")).toBeNull();
    expect(await loadMe("token-cooldown")).toBeNull();
    expect(getCalls()).toBe(1);
  });

  test("retries a failed request when asked", async () => {
    const getCalls = mockFetch([serverErrorResponse, okResponse]);

    expect(await loadMe("token-retry")).toBeNull();
    const me = await loadMe("token-retry", { retryFailed: true });

    expect(me?.accountId).toBe("staff01");
    expect(getCalls()).toBe(2);
  });

  test("reuses the result when only the token of the same account changes", async () => {
    // 로그인 연장(재발급)은 같은 계정의 토큰만 바꾼다.
    const getCalls = mockFetch([okResponse]);

    await loadMe(createToken("same-account", "jti-1"));
    await loadMe(createToken("same-account", "jti-2"));

    expect(getCalls()).toBe(1);
  });

  test("fetches again for a different account", async () => {
    const getCalls = mockFetch([okResponse]);

    await loadMe(createToken("account-a", "jti-1"));
    await loadMe(createToken("account-b", "jti-1"));

    expect(getCalls()).toBe(2);
  });

  test("does not refetch a successful result even when retry is asked", async () => {
    const getCalls = mockFetch([okResponse]);

    await loadMe("token-success");
    await loadMe("token-success", { retryFailed: true });

    expect(getCalls()).toBe(1);
  });
});
