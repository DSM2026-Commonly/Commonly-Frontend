import { fetchMe, getAuthToken, type Me } from "@commonly/utils";
import { useEffect, useState } from "react";

// 실패한 조회는 이 시간 동안 기억해, 화면이 여러 번 그려져도 같은 오류로 계속 재요청하지 않는다.
const FAILED_REQUEST_COOLDOWN_MS = 30_000;

interface MeRequest {
  token: string;
  promise: Promise<Me | null>;
  /** 조회에 실패한 시각. 성공했거나 아직 응답 전이면 null 이다. */
  failedAt: number | null;
}

// 헤더와 화면이 같은 토큰으로 여러 번 부르지 않도록 토큰마다 한 번만 요청한다.
let cachedRequest: MeRequest | null = null;
const listeners = new Set<() => void>();

function shouldRequest(token: string, retryFailed: boolean) {
  if (cachedRequest?.token !== token) {
    return true;
  }

  const { failedAt } = cachedRequest;

  return (
    failedAt !== null &&
    (retryFailed || Date.now() - failedAt >= FAILED_REQUEST_COOLDOWN_MS)
  );
}

/**
 * 토큰의 내 정보를 불러온다. 실패(네트워크, 5xx 등)하면 null 이다.
 * retryFailed 는 사용자가 다시 시도를 누른 경우처럼, 실패한 조회를 기다리지 않고 바로 다시 요청한다.
 */
export function loadMe(
  token: string,
  { retryFailed = false }: { retryFailed?: boolean } = {},
): Promise<Me | null> {
  if (!cachedRequest || shouldRequest(token, retryFailed)) {
    const request: MeRequest = {
      token,
      failedAt: null,
      promise: Promise.resolve(null),
    };

    request.promise = fetchMe({ token }).catch(() => {
      request.failedAt = Date.now();
      return null;
    });
    cachedRequest = request;
    // 이미 화면에 있는 다른 소비자(헤더 등)도 새 결과를 받게 알린다.
    void request.promise.then(() => {
      listeners.forEach((listener) => listener());
    });
  }

  return cachedRequest.promise;
}

export interface MeState {
  me: Me | null;
  /** 지금 토큰으로 조회가 아직 끝나지 않았다. 끝났는데 me 가 null 이면 조회에 실패한 것이다. */
  isLoading: boolean;
  /** 실패한 조회를 다시 요청한다. */
  retry: () => void;
}

/** useMe 와 같지만, 조회 중인지 실패했는지 구분해야 하는 화면을 위해 로딩 여부도 돌려준다. */
export function useMeState(): MeState {
  const token = getAuthToken();
  const [loaded, setLoaded] = useState<{ token: string; me: Me | null } | null>(
    null,
  );
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const handleRequestSettled = () => {
      setRequestVersion((version) => version + 1);
    };

    listeners.add(handleRequestSettled);

    return () => {
      listeners.delete(handleRequestSettled);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    void loadMe(token).then((me) => {
      if (isActive) {
        setLoaded({ token, me });
      }
    });

    return () => {
      isActive = false;
    };
  }, [token, requestVersion]);

  const retry = () => {
    if (!token) {
      return;
    }

    setLoaded(null);
    void loadMe(token, { retryFailed: true });
  };

  // 토큰이 바뀌었는데 이전 사용자 정보가 남아 보이지 않게 지금 토큰의 결과만 돌려준다.
  return token && loaded?.token === token
    ? { me: loaded.me, isLoading: false, retry }
    : { me: null, isLoading: Boolean(token), retry };
}

/**
 * 로그인한 사용자 정보(실명·생년월일 등). 조회 전이거나 실패하면 null 이므로
 * 호출부는 토큰에서 읽은 계정 정보로 대신 표시한다.
 */
function useMe(): Me | null {
  return useMeState().me;
}

export default useMe;
