import { hasAuthToken } from "@commonly/utils";
import {
  createBrowserRouter,
  redirect,
  type LoaderFunctionArgs,
} from "react-router";
import AdminLayout from "../layout/AdminLayout";
import CareerCertificateIssuePage from "../pages/CareerCertificateIssuePage";
import CareerEditPage from "../pages/CareerEditPage";
import HomePage from "../pages/HomePage";
import IntegratedRegistrationNoticePage from "../pages/IntegratedRegistrationNoticePage";
import IntegratedRegistrationUploadPage from "../pages/IntegratedRegistrationUploadPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import RoutePlaceholderPage from "../pages/RoutePlaceholderPage";
import UserDeletionCompletePage from "../pages/UserDeletionCompletePage";
import UserDeletionPage from "../pages/UserDeletionPage";
import UserListPage from "../pages/UserListPage";
import UserManagementPage from "../pages/UserManagementPage";
import UserRegistrationCompletePage from "../pages/UserRegistrationCompletePage";
import UserRegistrationPage from "../pages/UserRegistrationPage";
import WorkHistoryPage from "../pages/WorkHistoryPage";

function requireAuth({ request }: LoaderFunctionArgs) {
  if (hasAuthToken()) {
    return null;
  }

  const requestUrl = new URL(request.url);
  const redirectTo = `${requestUrl.pathname}${requestUrl.search}${requestUrl.hash}`;

  return redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
}

function redirectAuthenticatedUser() {
  return hasAuthToken() ? redirect("/") : null;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    loader: redirectAuthenticatedUser,
    Component: LoginPage,
  },
  {
    path: "/",
    loader: requireAuth,
    Component: AdminLayout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: "career/issue",
        Component: CareerCertificateIssuePage,
      },
      {
        path: "career/register",
        Component: IntegratedRegistrationNoticePage,
      },
      {
        path: "career/register/bulk",
        Component: IntegratedRegistrationNoticePage,
      },
      {
        path: "career/register/bulk/upload",
        Component: IntegratedRegistrationUploadPage,
      },
      {
        path: "career/register/bulk/confirm",
        element: (
          <RoutePlaceholderPage
            title="데이터 확인"
            description="업로드한 경력사항 데이터를 확인하는 페이지를 준비 중입니다."
          />
        ),
      },
      {
        path: "career/edit",
        Component: CareerEditPage,
      },
      {
        path: "accounts",
        Component: UserManagementPage,
      },
      {
        path: "accounts/list",
        Component: UserListPage,
      },
      {
        path: "accounts/register",
        Component: UserRegistrationPage,
      },
      {
        path: "accounts/register/complete",
        Component: UserRegistrationCompletePage,
      },
      {
        path: "accounts/delete",
        Component: UserDeletionPage,
      },
      {
        path: "accounts/delete/complete",
        Component: UserDeletionCompletePage,
      },
      {
        path: "history",
        Component: WorkHistoryPage,
      },
      {
        path: "*",
        Component: NotFoundPage,
      },
    ],
  },
]);
