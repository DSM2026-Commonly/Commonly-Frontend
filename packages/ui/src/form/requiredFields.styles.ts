import { css } from "@emotion/react";
import styled from "@emotion/styled";

const requiredMarkStyles = css`
  margin-left: 2px;
  color: var(--krds-light-color-text-danger, #bd2c0f);
`;

/**
 * 직접 그린 라벨 옆 필수 표시. 필수 여부는 입력 요소의 required/aria-required 로
 * 스크린리더에 전달하므로 aria-hidden 과 함께 쓴다.
 */
export const RequiredMark = styled.span`
  ${requiredMarkStyles}
`;

/**
 * krds 입력 컴포넌트는 label 을 문자열로만 받아 별표를 끼울 수 없다.
 * 필수(required/aria-required) 입력을 감싼 .form-group 의 라벨 뒤에 같은 별표를 붙인다.
 * 대체 텍스트를 비워 스크린리더가 별표를 라벨 이름에 섞어 읽지 않게 한다.
 */
export const requiredLabelStyles = css`
  .form-group:has(> .form-conts :is([required], [aria-required="true"]))
    > .form-tit
    label::after {
    content: "*";
    content: "*" / "";
    ${requiredMarkStyles}
  }
`;

/** 진행 버튼이 비활성인 이유를 알려주는 회색 안내. */
export const FormHint = styled.p`
  margin: 0;
  color: var(--krds-light-color-text-subtle, #464c53);
  font-size: 15px;
  line-height: 1.5;
  text-align: right;
`;
