import styled from "@emotion/styled";

export const ApplicationShellRoot = styled.div`
  width: 100%;
`;

interface ApplicationViewportProps {
  $fillViewport: boolean;
}

export const ApplicationViewport = styled.div<ApplicationViewportProps>`
  display: flex;
  width: 100%;
  min-height: ${({ $fillViewport }) => ($fillViewport ? "100vh" : "auto")};
  min-height: ${({ $fillViewport }) => ($fillViewport ? "100svh" : "auto")};
  flex-direction: column;
`;

export const ApplicationMain = styled.main`
  width: 100%;
  min-width: 0;
  flex: 1 0 auto;
`;
