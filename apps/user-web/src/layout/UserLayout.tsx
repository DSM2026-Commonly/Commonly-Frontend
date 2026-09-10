import {
  ApplicationShell,
  type FooterProps,
  type HeaderProps,
  INITIAL_PASSWORD_CHANGE_PATH,
  usePasswordChangeGuard,
  useScrollToTopOnChange,
  useSessionGuard,
} from "@commonly/ui";
import { clearAuthToken } from "@commonly/utils";
import { useCallback, type ReactNode } from "react";
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

  useScrollToTopOnChange(pathname);
  useSessionGuard(
    useCallback(() => {
      void navigate(
        `/login?redirectTo=${encodeURIComponent(`${pathname}${window.location.search}`)}`,
        { replace: true },
      );
    }, [navigate, pathname]),
  );
  usePasswordChangeGuard(
    useCallback(() => {
      // 이미 비밀번호 변경 화면이면 다시 이동하지 않는다(무한 이동 방지).
      if (pathname === INITIAL_PASSWORD_CHANGE_PATH) {
        return;
      }

      void navigate(
        `${INITIAL_PASSWORD_CHANGE_PATH}?redirectTo=${encodeURIComponent(`${pathname}${window.location.search}`)}`,
        { replace: true },
      );
    }, [navigate, pathname]),
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
