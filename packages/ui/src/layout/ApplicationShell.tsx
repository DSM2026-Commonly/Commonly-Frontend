import type { ReactNode } from "react";
import Header, {
  type HeaderProps,
  type HeaderVariant,
} from "../header/Header";
import {
  ApplicationMain,
  ApplicationShellRoot,
  ApplicationViewport,
} from "./applicationShell.styles";
import Footer, { type FooterProps } from "./footer";

export interface ApplicationShellProps {
  children?: ReactNode;
  headerVariant: HeaderVariant;
  headerProps?: Omit<HeaderProps, "variant">;
  footerProps?: FooterProps;
  fillViewport?: boolean;
}

function ApplicationShell({
  children,
  headerVariant,
  headerProps,
  footerProps,
  fillViewport = true,
}: ApplicationShellProps) {
  return (
    <ApplicationShellRoot>
      <ApplicationViewport $fillViewport={fillViewport}>
        <Header {...headerProps} variant={headerVariant} />
        <ApplicationMain id="main-content">{children}</ApplicationMain>
      </ApplicationViewport>
      <Footer {...footerProps} />
    </ApplicationShellRoot>
  );
}

export default ApplicationShell;
