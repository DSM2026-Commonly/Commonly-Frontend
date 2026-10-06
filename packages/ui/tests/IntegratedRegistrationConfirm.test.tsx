import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import IntegratedRegistrationConfirm from "../src/registration/integrated-registration-confirm/IntegratedRegistrationConfirm";

describe("IntegratedRegistrationConfirm required mappings", () => {
  // 백엔드가 강제하는 성명·생년월일·성별과, 화면에 경력을 띄우는 데 필요한 채용일을 필수로 표시한다.
  test("marks the fields the backend requires as required", () => {
    const markup = renderToStaticMarkup(
      <IntegratedRegistrationConfirm rowOptions={["열 선택", "성명"]} />,
    );

    for (const label of ["성명", "생년월일", "성별", "채용일"]) {
      expect(markup).toContain(`aria-label="${label} 행 선택 (필수)"`);
    }
    expect(markup).toContain('aria-label="근무부서 행 선택"');
  });
});
