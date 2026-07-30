import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import IndividualRegistrationComplete from "../src/registration/individual-registration-complete/IndividualRegistrationComplete";

describe("IndividualRegistrationComplete", () => {
  test("renders the approved default completion content", () => {
    const markup = renderToStaticMarkup(<IndividualRegistrationComplete />);

    expect(markup).toContain("경력사항 개별 등록");
    expect(markup).toContain("업무 처리가");
    expect(markup).toContain("전재준");
    expect(markup).toContain("~~ 업무");
    expect(markup).toContain("추가 등록하기");
    expect(markup).toContain("홈으로 돌아가기");
  });

  test("renders submitted subject and career data", () => {
    const markup = renderToStaticMarkup(
      <IndividualRegistrationComplete
        subjectName="홍길동"
        duties="민원 업무"
      />,
    );

    expect(markup).toContain("홍길동");
    expect(markup).toContain("민원 업무");
  });
});
