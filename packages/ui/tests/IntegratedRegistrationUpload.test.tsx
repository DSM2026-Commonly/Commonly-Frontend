import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import IntegratedRegistrationUpload from "../src/registration/integrated-registration-upload/IntegratedRegistrationUpload";

describe("IntegratedRegistrationUpload restored file", () => {
  // 새로고침 뒤 복원한 파일도 "[, 0B]"가 아니라 형식과 크기를 보여줘야 한다.
  test("shows the restored file's type and size", () => {
    const markup = renderToStaticMarkup(
      <IntegratedRegistrationUpload
        initialFileName="경력 서식.xlsx"
        initialFileSize={1843}
      />,
    );

    expect(markup).toContain("경력 서식.xlsx");
    expect(markup).not.toContain("[, 0B]");
    expect(markup).toMatch(/xlsx,\s*1\.8\s*KB/);
  });
});
