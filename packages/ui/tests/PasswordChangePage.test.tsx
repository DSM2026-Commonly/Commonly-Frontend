import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import Header from "../src/header/Header";
import PasswordChangePage, {
  PASSWORD_CHANGE_PATH,
} from "../src/pages/PasswordChangePage";

describe("PasswordChangePage", () => {
  test("renders current/new/confirm password fields", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={[PASSWORD_CHANGE_PATH]}>
        <PasswordChangePage />
      </MemoryRouter>,
    );

    expect(markup).toContain("비밀번호 변경");
    expect(markup).toContain("현재 비밀번호");
    expect(markup).toContain("새 비밀번호");
    expect(markup).toContain("새 비밀번호 확인");
    expect(markup).toContain('name="currentPassword"');
    expect(markup).toContain('name="newPassword"');
    expect(markup).toContain('name="newPasswordConfirm"');
  });

  test("blocks submit and explains why when my account info is unavailable", () => {
    // 테스트 환경에는 저장된 토큰이 없어 내 정보 조회가 실패한 상태와 같다.
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={[PASSWORD_CHANGE_PATH]}>
        <PasswordChangePage />
      </MemoryRouter>,
    );

    expect(markup).toContain("계정 정보를 불러오지 못해 비밀번호를 변경할 수 없습니다.");
    const submitButton = markup.match(/<button[^>]*type="submit"[^>]*>/)?.[0];
    expect(submitButton).toContain('disabled=""');
  });
});

describe("Header password change link", () => {
  test("links to the password change page next to logout", () => {
    const markup = renderToStaticMarkup(<Header variant="civil" />);

    expect(markup).toContain(`href="${PASSWORD_CHANGE_PATH}"`);
    expect(markup.indexOf("비밀번호 변경")).toBeLessThan(
      markup.indexOf("로그아웃"),
    );
  });

  test("is hidden on the not-auth header", () => {
    const markup = renderToStaticMarkup(<Header variant="not-auth" />);

    expect(markup).not.toContain(PASSWORD_CHANGE_PATH);
  });
});
