import {
  ApplicationShell,
  type FooterProps,
  type HeaderProps,
  useScrollToTopOnChange,
} from "@commonly/ui";
import { clearAuthToken } from "@commonly/utils";
import type { ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

export interface AdminLayoutProps {
  children?: ReactNode;
  headerProps?: Omit<HeaderProps, "variant">;
  footerProps?: FooterProps;
}

function AdminLayout({
  children,
  headerProps,
  footerProps,
}: AdminLayoutProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isCareerRegistrationPath =
    pathname === "/career/register" ||
    pathname.startsWith("/career/register/");
  const isUserManagementPath =
    pathname === "/accounts" || pathname.startsWith("/accounts/");

  useScrollToTopOnChange(
    pathname,
    isCareerRegistrationPath || isUserManagementPath,
  );

  const handleNavigate =
    headerProps?.onNavigate ?? ((href: string) => void navigate(href));
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
      headerVariant="admin"
      headerProps={{
        ...headerProps,
        onNavigate: handleNavigate,
        onLogout: handleLogout,
      }}
      footerProps={footerProps}
    >
      {children ?? <Outlet />}
    </ApplicationShell>
  );
}

export default AdminLayout;
