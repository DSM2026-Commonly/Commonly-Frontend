import { hasValidAuthToken } from "@commonly/utils";
import {
  createBrowserRouter,
  redirect,
  type LoaderFunctionArgs,
} from "react-router";
import UserLayout from "../layout/UserLayout";
import CareerCertificateIssuePage from "../pages/CareerCertificateIssuePage";
import CareerEditPage from "../pages/CareerEditPage";
import HomePage from "../pages/HomePage";
import IndividualRegistrationCareerPage from "../pages/IndividualRegistrationCareerPage";
import IndividualRegistrationCompletePage from "../pages/IndividualRegistrationCompletePage";
import IndividualRegistrationNoticePage from "../pages/IndividualRegistrationNoticePage";
import IndividualRegistrationSubjectPage from "../pages/IndividualRegistrationSubjectPage";
import InitialPasswordChangePage from "../pages/InitialPasswordChangePage";
import IntegratedRegistrationConfirmPage from "../pages/IntegratedRegistrationConfirmPage";
import IntegratedRegistrationCompletePage from "../pages/IntegratedRegistrationCompletePage";
import IntegratedRegistrationNoticePage from "../pages/IntegratedRegistrationNoticePage";
import IntegratedRegistrationPreviewPage from "../pages/IntegratedRegistrationPreviewPage";
import IntegratedRegistrationUploadPage from "../pages/IntegratedRegistrationUploadPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import RegistrationMethodPage from "../pages/RegistrationMethodPage";

function requireAuth({ request }: LoaderFunctionArgs) {
  if (hasValidAuthToken()) {
    return null;
  }

  const requestUrl = new URL(request.url);
  const redirectTo = `${requestUrl.pathname}${requestUrl.search}${requestUrl.hash}`;

  return redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
}

function redirectAuthenticatedUser() {
  return hasValidAuthToken() ? redirect("/") : null;
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
    Component: UserLayout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: "password/initial",
        Component: InitialPasswordChangePage,
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
        path: "*",
        Component: NotFoundPage,
      },
    ],
  },
]);
