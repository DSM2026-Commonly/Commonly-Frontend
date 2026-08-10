import {
  ApplicationShell,
  type FooterProps,
  type HeaderProps,
  useScrollToTopOnChange,
} from "@commonly/ui";
import { clearAuthToken } from "@commonly/utils";
import { useState, type ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

export interface CivilLayoutProps {
  children?: ReactNode;
  headerProps?: Omit<HeaderProps, "variant">;
  footerProps?: FooterProps;
}

function CivilLayout({
  children,
  headerProps,
  footerProps,
}: CivilLayoutProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [issueFlowKey, setIssueFlowKey] = useState(0);

  useScrollToTopOnChange(pathname);
  const handleNavigate = (href: string) => {
    if (href === "/") {
      setIssueFlowKey((currentKey) => currentKey + 1);
    }

    if (headerProps?.onNavigate) {
      headerProps.onNavigate(href);
      return;
    }

    void navigate(href);
  };
  const handleLogout =
    headerProps?.onLogout ??
    (() => {
      if (!window.confirm("로그아웃하시겠습니까?")) {
        return;
      }

      clearAuthToken();
      void navigate("/login", { replace: true });
    });

  return (
    <ApplicationShell
      headerVariant="civil"
      headerProps={{
        ...headerProps,
        onNavigate: handleNavigate,
        onLogout: handleLogout,
      }}
      footerProps={footerProps}
    >
      {children ?? <Outlet key={issueFlowKey} />}
    </ApplicationShell>
  );
}

export default CivilLayout;
