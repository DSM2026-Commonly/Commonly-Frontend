import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import Pagination from "../src/pagination/Pagination";

const noop = () => undefined;

describe("Pagination", () => {
  test("renders the given nav label and marks the current page", () => {
    const markup = renderToStaticMarkup(
      <Pagination
        currentPage={2}
        totalPages={3}
        navLabel="대상자 목록 페이지"
        onPageChange={noop}
      />,
    );

    expect(markup).toContain('aria-label="대상자 목록 페이지"');
    expect(markup).toContain('aria-label="2페이지"');
    expect(markup).toContain('aria-current="page"');
    // 8페이지 이하이면 생략 부호 없이 모든 번호를 노출한다.
    expect(markup).not.toContain("···");
  });

  test("disables 이전 on the first page and 다음 on the last page", () => {
    const first = renderToStaticMarkup(
      <Pagination
        currentPage={1}
        totalPages={3}
        navLabel="목록 페이지"
        onPageChange={noop}
      />,
    );
    // 이전 버튼만 비활성화된다(emotion 이 넣는 CSS 텍스트와 섞이지 않게 속성만 센다).
    expect(first.match(/disabled=""/g)).toHaveLength(1);

    const last = renderToStaticMarkup(
      <Pagination
        currentPage={3}
        totalPages={3}
        navLabel="목록 페이지"
        onPageChange={noop}
      />,
    );
    expect(last.match(/disabled=""/g)).toHaveLength(1);
  });

  test("shows an ellipsis when there are many pages", () => {
    const markup = renderToStaticMarkup(
      <Pagination
        currentPage={10}
        totalPages={20}
        navLabel="목록 페이지"
        onPageChange={noop}
      />,
    );

    expect(markup).toContain("···");
    expect(markup).toContain('aria-label="1페이지"');
    expect(markup).toContain('aria-label="20페이지"');
  });

  test("falls back to hasNextPage when totalPages is unknown", () => {
    const withNext = renderToStaticMarkup(
      <Pagination
        currentPage={1}
        hasNextPage
        navLabel="목록 페이지"
        onPageChange={noop}
      />,
    );
    // 다음 페이지가 있으면 2페이지 버튼까지 노출하고 다음 버튼을 열어 둔다.
    expect(withNext).toContain('aria-label="2페이지"');

    const noNext = renderToStaticMarkup(
      <Pagination
        currentPage={1}
        hasNextPage={false}
        navLabel="목록 페이지"
        onPageChange={noop}
      />,
    );
    // 다음 페이지가 없으면 이전·다음 모두 비활성화된다.
    expect(noNext.match(/disabled=""/g)).toHaveLength(2);
  });
});
