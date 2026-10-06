import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { getMissingCertificateDetailsFields } from "../src/career-certificate/CareerCertificateIssue.validation";
import DetailsStep from "../src/career-certificate/steps/DetailsStep";
import CareerEdit from "../src/career-edit/CareerEdit";
import type { CareerEditRecord } from "../src/career-edit/CareerEdit.types";
import IndividualRegistrationCareer from "../src/registration/individual-registration-career/IndividualRegistrationCareer";
import IndividualRegistrationSubject from "../src/registration/individual-registration-subject/IndividualRegistrationSubject";

const noop = () => undefined;

// emotion 이 정적 렌더 결과 사이사이에 끼워 넣는 <style> 을 걷어내고 마크업만 본다.
const withoutStyles = (html: string) =>
  html.replace(/<style[^>]*>.*?<\/style>/g, "");

function renderDetails(purpose: string) {
  return renderToStaticMarkup(
    <DetailsStep
      variant="civil"
      issueType="all"
      careerRows={[]}
      selectedCareerIds={[]}
      ownCareerLoadStatus="loaded"
      additionalNote=""
      purpose={purpose}
      onIssueTypeChange={noop}
      onCareerSelection={noop}
      onSelectAll={noop}
      onAdditionalNoteChange={noop}
      onPurposeChange={noop}
    />,
  );
}

const careerRecord: CareerEditRecord = {
  id: "career-1",
  position: "행정",
  duties: "민원 접수",
  department: "",
  startDate: "2020.03.01",
  endDate: "",
  retirementReason: "",
  note: "",
};

describe("required field hints", () => {
  test("career registration lists every required field on first render", () => {
    const html = renderToStaticMarkup(<IndividualRegistrationCareer />);
    const markup = withoutStyles(html);

    expect(markup).toMatch(
      /<p role="status"[^>]*>필수 항목을 입력해 주세요: 직종명, 담당업무, 근무부서, 근무 시작일, 근무 종료일, 퇴직 사유<\/p>/,
    );
    // 직접 그린 날짜 라벨의 별표는 스크린리더에서 숨긴다.
    expect(markup).toMatch(/근무 시작일<span aria-hidden="true"[^>]*>\*<\/span>/);
    expect(markup).toMatch(/근무 종료일<span aria-hidden="true"[^>]*>\*<\/span>/);
    // krds 라벨의 별표는 필수 입력을 감싼 라벨 뒤에 CSS 로 붙인다.
    expect(html).toContain('[aria-required="true"]))>.form-tit label::after');
  });

  test("subject registration lists the missing subject fields", () => {
    const markup = withoutStyles(
      renderToStaticMarkup(<IndividualRegistrationSubject />),
    );

    expect(markup).toMatch(
      /<p role="status"[^>]*>필수 항목을 입력해 주세요: 이름, 성별, 생년월일, 주소지<\/p>/,
    );
    expect(markup).toMatch(/id="[^"]*-name"[^>]*aria-required="true"/);
    expect(markup).toMatch(/성별<span aria-hidden="true"[^>]*>\*<\/span>/);
  });

  test("career edit lists the emptied field next to the save button", () => {
    const html = renderToStaticMarkup(
      <CareerEdit
        initialStep={4}
        initialEditTarget="career"
        careerRecords={[careerRecord]}
      />,
    );

    expect(html).toContain("필수 항목을 입력해 주세요: 근무부서");
    expect(html).toMatch(/id="career-edit-department"[^>]*aria-required="true"/);
  });

  test("career edit asks to finish or clear a partial end date", () => {
    const html = renderToStaticMarkup(
      <CareerEdit
        initialStep={4}
        initialEditTarget="career"
        careerRecords={[
          { ...careerRecord, department: "총무과", endDate: "2021.." },
        ]}
      />,
    );

    expect(html).not.toContain("필수 항목을 입력해 주세요");
    expect(html).toContain(
      "근무 종료일은 모두 입력하거나, 재직 중이면 모두 비워 주세요.",
    );
  });

  test("certificate details asks for the purpose until it is entered", () => {
    expect(getMissingCertificateDetailsFields(" ")).toEqual(["용도"]);
    expect(getMissingCertificateDetailsFields("제출용")).toEqual([]);

    expect(renderDetails("")).toContain("필수 항목을 입력해 주세요: 용도");
    expect(renderDetails("")).toMatch(
      /id="certificate-all-purpose"[^>]*aria-required="true"/,
    );
    expect(renderDetails("제출용")).not.toContain('role="status"');
  });
});
