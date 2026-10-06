import { css } from "@emotion/react";

/**
 * krds 셀렉트는 값을 골라도 플레이스홀더와 같은 흐린 글자로 남는다.
 * 값이 있는 셀렉트에 completed 클래스를 붙이면 옆 입력란과 같은 진한 글자로 보이게 한다.
 */
export const completedSelectStyles = css`
  .krds-form-select.completed {
    color: var(--krds-light-color-text-basic, #1e2124);
  }
`;

/** 값이 있으면 completed 클래스를 돌려준다. */
export const getSelectClassName = (value: string) =>
  value ? "completed" : undefined;
