import { fetchMe, getAuthToken, type Me } from "@commonly/utils";
import { useEffect, useState } from "react";

// 헤더와 화면이 같은 토큰으로 여러 번 부르지 않도록 토큰마다 한 번만 요청한다.
// 실패(미배포 404, 네트워크 등)도 그 토큰 동안은 null 로 기억해 계속 재요청하지 않는다.
let cachedRequest: { token: string; promise: Promise<Me | null> } | null = null;

function loadMe(token: string): Promise<Me | null> {
  if (cachedRequest?.token !== token) {
    cachedRequest = {
      token,
      promise: fetchMe({ token }).catch(() => null),
    };
  }

  return cachedRequest.promise;
}

/**
 * 로그인한 사용자 정보(실명·생년월일 등). 조회 전이거나 실패하면 null 이므로
 * 호출부는 토큰에서 읽은 계정 정보로 대신 표시한다.
 */
function useMe(): Me | null {
  const token = getAuthToken();
  const [loaded, setLoaded] = useState<{ token: string; me: Me | null } | null>(
    null,
  );

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
  }, [token]);

  // 토큰이 바뀌었는데 이전 사용자 정보가 남아 보이지 않게 지금 토큰의 결과만 돌려준다.
  return token && loaded?.token === token ? loaded.me : null;
}

export default useMe;
