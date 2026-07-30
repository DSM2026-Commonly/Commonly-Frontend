import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import WorkHistory from "../src/work-history/WorkHistory";

describe("WorkHistory", () => {
  test("renders pagination without a direct page input", () => {
    const markup = renderToStaticMarkup(<WorkHistory />);

    expect(markup).toContain('aria-label="업무 이력 페이지"');
    expect(markup).not.toContain("페이지 바로 이동");
    expect(markup).not.toContain("이동할 페이지");
  });
});
