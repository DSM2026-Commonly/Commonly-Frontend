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
import IntegratedRegistrationCompletePage from "../pages/IntegratedRegistrationCompletePage";
import IntegratedRegistrationConfirmPage from "../pages/IntegratedRegistrationConfirmPage";
import IntegratedRegistrationNoticePage from "../pages/IntegratedRegistrationNoticePage";
import IntegratedRegistrationUploadPage from "../pages/IntegratedRegistrationUploadPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
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
        // admin 에는 등록 방식 선택 화면이 없어 bulk 경로를 유의사항 화면으로 통일한다.
        path: "career/register/bulk",
        loader: () => redirect("/career/register"),
      },
      {
        path: "career/register/bulk/upload",
        Component: IntegratedRegistrationUploadPage,
      },
      {
        path: "career/register/bulk/confirm",
        Component: IntegratedRegistrationConfirmPage,
      },
      {
        path: "career/register/bulk/complete",
        Component: IntegratedRegistrationCompletePage,
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
