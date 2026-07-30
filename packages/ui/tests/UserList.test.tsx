import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import UserList from "../src/user-management/UserList";

describe("UserList", () => {
  test("renders the approved default user list content", () => {
    const markup = renderToStaticMarkup(<UserList />);

    expect(markup).toContain("사용자 목록 조회");
    expect(markup.match(/전재준/g)).toHaveLength(10);
    expect(markup).toContain("글로리1234");
    expect(markup).toContain("대전광역시 유성구 가정북로 76");
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
