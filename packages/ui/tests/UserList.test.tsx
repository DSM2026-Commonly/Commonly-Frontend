import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import UserList from "../src/user-management/UserList";

describe("UserList", () => {
  test("renders an empty state when no accounts are supplied", () => {
    const markup = renderToStaticMarkup(<UserList />);

    expect(markup).toContain("사용자 목록 조회");
    // 더미 기본값이 없으므로 빈 목록 안내만 보여야 한다.
    expect(markup).toContain("조회된 사용자가 없습니다.");
    expect(markup).not.toContain("전재준");
    expect(markup).not.toContain("페이지 바로 이동");
    expect(markup).not.toContain("이동할 페이지");
    expect(markup).not.toContain("홈으로 돌아가기");
  });

  test("renders supplied accounts and clamps pagination bounds", () => {
    const markup = renderToStaticMarkup(
      <UserList
        accounts={[
          {
            id: "hong-gildong",
            name: "홍길동",
            accountId: "hong1234",
            department: "대전광역시 유성구청",
          },
        ]}
        totalPages={0}
        initialPage={10}
      />,
    );

    expect(markup).toContain("홍길동");
    expect(markup).toContain("hong1234");
    expect(markup).toContain('aria-current="page"');
  });
});
