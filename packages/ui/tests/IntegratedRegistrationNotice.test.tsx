import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import IntegratedRegistrationNotice from "../src/registration/integrated-registration/IntegratedRegistrationNotice";

describe("IntegratedRegistrationNotice", () => {
  test("shows why it could not move on as an alert", () => {
    const html = renderToStaticMarkup(
      <IntegratedRegistrationNotice errorMessage="동의 상태를 저장하지 못했습니다." />,
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain("동의 상태를 저장하지 못했습니다.");
  });

  test("renders no alert without an error", () => {
    const html = renderToStaticMarkup(<IntegratedRegistrationNotice />);

    expect(html).not.toContain('role="alert"');
  });
});
