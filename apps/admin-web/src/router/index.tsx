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
import IndividualRegistrationCareerPage from "../pages/IndividualRegistrationCareerPage";
import IndividualRegistrationCompletePage from "../pages/IndividualRegistrationCompletePage";
import IndividualRegistrationNoticePage from "../pages/IndividualRegistrationNoticePage";
import IndividualRegistrationSubjectPage from "../pages/IndividualRegistrationSubjectPage";
import IntegratedRegistrationCompletePage from "../pages/IntegratedRegistrationCompletePage";
import IntegratedRegistrationConfirmPage from "../pages/IntegratedRegistrationConfirmPage";
import IntegratedRegistrationNoticePage from "../pages/IntegratedRegistrationNoticePage";
import IntegratedRegistrationPreviewPage from "../pages/IntegratedRegistrationPreviewPage";
import IntegratedRegistrationUploadPage from "../pages/IntegratedRegistrationUploadPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import RegistrationMethodPage from "../pages/RegistrationMethodPage";
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
        Component: RegistrationMethodPage,
      },
      {
        path: "career/register/individual",
        Component: IndividualRegistrationNoticePage,
      },
      {
        path: "career/register/individual/subject",
        Component: IndividualRegistrationSubjectPage,
      },
      {
        path: "career/register/individual/career",
        Component: IndividualRegistrationCareerPage,
      },
      {
        path: "career/register/individual/complete",
        Component: IndividualRegistrationCompletePage,
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
        Component: IntegratedRegistrationConfirmPage,
      },
      {
        path: "career/register/bulk/preview",
        Component: IntegratedRegistrationPreviewPage,
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
