import {
  ApplicationShell,
  type FooterProps,
  type HeaderProps,
  useScrollToTopOnChange,
} from "@commonly/ui";
import { clearAuthToken } from "@commonly/utils";
import type { ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

export interface UserLayoutProps {
  children?: ReactNode;
  headerProps?: Omit<HeaderProps, "variant">;
  footerProps?: FooterProps;
}

function UserLayout({
  children,
  headerProps,
  footerProps,
}: UserLayoutProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isCareerRegistrationPath =
    pathname === "/career/register" ||
    pathname.startsWith("/career/register/");

  useScrollToTopOnChange(pathname, isCareerRegistrationPath);

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
      headerVariant="user"
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

export default UserLayout;
