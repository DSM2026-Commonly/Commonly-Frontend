import { hasAuthToken } from "@commonly/utils";
import {
  createBrowserRouter,
  redirect,
  type LoaderFunctionArgs,
} from "react-router";
import CivilLayout from "../layout/CivilLayout";
import CareerCertificateIssuePage from "../pages/CareerCertificateIssuePage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import SignupFormPage from "../pages/SignupFormPage";
import SignupPage from "../pages/SignupPage";

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
    path: "/signup",
    loader: redirectAuthenticatedUser,
    Component: SignupPage,
  },
  {
    path: "/signup/form",
    loader: redirectAuthenticatedUser,
    Component: SignupFormPage,
  },
  {
    path: "/",
    loader: requireAuth,
    Component: CivilLayout,
    children: [
      {
        index: true,
        Component: CareerCertificateIssuePage,
      },
      {
        path: "career/issue",
        Component: CareerCertificateIssuePage,
      },
      {
        path: "*",
        Component: NotFoundPage,
      },
    ],
  },
]);
