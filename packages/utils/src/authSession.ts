import { getAuthToken, type AuthStorage } from "./auth";

/**
 * 액세스 토큰(JWT) 페이로드에서 읽어낸 로그인 세션 정보.
 * 별도의 내 정보 조회 API 없이 헤더 사용자명·세션 만료 시각을 표시하는 데 쓴다.
 */
export interface AuthSession {
  /** 표시용 사용자명. 토큰에 이름 클레임이 없으면 계정 id 를 쓴다. */
  name: string;
  accountId: string;
  /** 만료 시각(ms epoch). 토큰에 exp 가 없으면 null. */
  expiresAt: number | null;
}

// 백엔드 JWT 의 이름 클레임 명칭이 확정되지 않아 흔히 쓰이는 후보를 순서대로 찾는다.
const NAME_CLAIM_KEYS = ["name", "userName", "username", "nickname"] as const;
const ACCOUNT_CLAIM_KEYS = ["accountId", "loginId", "userId", "sub"] as const;

function decodeBase64Url(segment: string): string | null {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  try {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    );

    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function decodeJwtPayload(
  token: string,
): Record<string, unknown> | null {
  const segments = token.split(".");

  if (segments.length < 2) {
    return null;
  }

  const json = decodeBase64Url(segments[1]);

  if (!json) {
    return null;
  }

  try {
    const payload: unknown = JSON.parse(json);

    return payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function pickStringClaim(
  payload: Record<string, unknown>,
  keys: readonly string[],
): string {
  for (const key of keys) {
    const value = payload[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

export function getAuthSession(storage?: AuthStorage): AuthSession | null {
  const token = getAuthToken(storage);

  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);

  if (!payload) {
    return null;
  }

  const accountId = pickStringClaim(payload, ACCOUNT_CLAIM_KEYS);
  const name = pickStringClaim(payload, NAME_CLAIM_KEYS) || accountId;
  const exp = payload.exp;
  const expiresAt =
    typeof exp === "number" && Number.isFinite(exp) ? exp * 1000 : null;

  return { name, accountId, expiresAt };
}

/** 만료까지 남은 시간을 "MM분 SS초" 형식으로 돌려준다. 만료됐거나 알 수 없으면 "00분 00초". */
export function formatRemainingSessionTime(
  expiresAt: number | null,
  now = Date.now(),
): string {
  if (expiresAt === null) {
    return "00분 00초";
  }

  const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return `${String(minutes).padStart(2, "0")}분 ${String(seconds).padStart(2, "0")}초`;
}

/** 저장된 토큰이 있고 만료되지 않았는지. 라우트 가드에서 쓴다. exp 가 없는 토큰은 유효한 것으로 본다. */
export function hasValidAuthToken(storage?: AuthStorage, now = Date.now()): boolean {
  const token = getAuthToken(storage);

  if (!token) {
    return false;
  }

  // JWT 로 해석되지 않는 토큰은 만료 여부를 알 수 없으므로 존재하면 유효한 것으로 본다.
  // (그렇지 않으면 로그인 직후 가드에 막혀 로그인 화면으로 되돌아가는 루프가 생긴다.)
  const session = getAuthSession(storage);

  if (!session) {
    return true;
  }

  return session.expiresAt === null || session.expiresAt > now;
}
