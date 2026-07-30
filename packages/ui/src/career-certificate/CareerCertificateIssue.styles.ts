import styled from "@emotion/styled";

export const FlowRoot = styled.section`
  --career-color-text: #1e2124;
  --career-color-text-subtle: #464c53;
  --career-color-primary: #256ef4;
  --career-color-border: #cdd1d5;
  --career-color-surface: #eef2f7;
  --career-color-surface-primary: #ecf2fe;

  width: 100%;
  animation: career-certificate-view-enter 280ms
    cubic-bezier(0.22, 1, 0.36, 1);
  color: var(--career-color-text);
  font-family:
    "Pretendard GOV", Pretendard, "Noto Sans KR", "Malgun Gothic", sans-serif;

  &,
  & * {
    box-sizing: border-box;
  }

  @keyframes career-certificate-view-enter {
    from {
      opacity: 0;
      transform: translateY(10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
