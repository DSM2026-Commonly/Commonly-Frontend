export { default } from "./layout/footer";
export type { FooterProps } from "./layout/footer";
export { default as ApplicationShell } from "./layout/ApplicationShell";
export type { ApplicationShellProps } from "./layout/ApplicationShell";
export { default as Header } from "./header/Header";
export type { HeaderProps, HeaderVariant } from "./header/Header";
export { default as Login } from "./login/Login";
export type { LoginFormData, LoginProps, LoginVariant } from "./login/Login";
export { default as CareerCertificateIssue } from "./career-certificate/CareerCertificateIssue";
export type {
  CareerCertificateApplicationData,
  CareerCertificateIssueProps,
  CareerCertificateIssueVariant,
  CareerCertificateIssueView,
  CertificateApplicant,
  CertificateCareerRow,
  CertificateIssueType,
} from "./career-certificate/CareerCertificateIssue";
export { default as CareerEdit } from "./career-edit/CareerEdit";
export type {
  CareerEditApplicant,
  CareerEditGender,
  CareerEditPersonalInfo,
  CareerEditProps,
  CareerEditReason,
  CareerEditRecord,
  CareerEditSubmission,
  CareerEditTarget,
} from "./career-edit/CareerEdit";
export { default as UserHome } from "./home/UserHome";
export type { UserHomeProps } from "./home/UserHome";
export { default as WorkHistory } from "./work-history/WorkHistory";
export type {
  WorkHistoryProps,
  WorkHistoryRecord,
} from "./work-history/WorkHistory";
export { default as RegistrationMethodSelector } from "./registration-method/RegistrationMethodSelector";
export type {
  RegistrationMethodOption,
  RegistrationMethodSelectorProps,
} from "./registration-method/RegistrationMethodSelector";
export { default as IntegratedRegistrationNotice } from "./registration/integrated-registration/IntegratedRegistrationNotice";
export type {
  IntegratedRegistrationNoticeProps,
  IntegratedRegistrationNoticeStep,
} from "./registration/integrated-registration/IntegratedRegistrationNotice";
export { default as AddressSearchModal } from "./registration/address-search/AddressSearchModal";
export type {
  AddressSearchItem,
  AddressSearchModalProps,
  AddressSearchQuery,
  AddressSearchResult,
} from "./registration/address-search/AddressSearchModal";
export { default as IndividualRegistrationSubject } from "./registration/individual-registration-subject/IndividualRegistrationSubject";
export type {
  IndividualRegistrationDuplicateCandidate,
  IndividualRegistrationSubjectData,
  IndividualRegistrationSubjectProps,
  IndividualRegistrationSubjectStep,
} from "./registration/individual-registration-subject/IndividualRegistrationSubject";
export { default as IndividualRegistrationCareer } from "./registration/individual-registration-career/IndividualRegistrationCareer";
export type {
  IndividualRegistrationCareerData,
  IndividualRegistrationCareerProps,
  IndividualRegistrationCareerStep,
} from "./registration/individual-registration-career/IndividualRegistrationCareer";
export { default as IndividualRegistrationComplete } from "./registration/individual-registration-complete/IndividualRegistrationComplete";
export type { IndividualRegistrationCompleteProps } from "./registration/individual-registration-complete/IndividualRegistrationComplete";
export { default as IntegratedRegistrationUpload } from "./registration/integrated-registration-upload/IntegratedRegistrationUpload";
export type {
  IntegratedRegistrationUploadProps,
  IntegratedRegistrationUploadStep,
} from "./registration/integrated-registration-upload/IntegratedRegistrationUpload";
export { default as IntegratedRegistrationConfirm } from "./registration/integrated-registration-confirm/IntegratedRegistrationConfirm";
export type {
  IntegratedRegistrationConfirmField,
  IntegratedRegistrationConfirmMapping,
  IntegratedRegistrationConfirmProps,
  IntegratedRegistrationConfirmStep,
} from "./registration/integrated-registration-confirm/IntegratedRegistrationConfirm";
export { default as IntegratedRegistrationPreview } from "./registration/integrated-registration-preview/IntegratedRegistrationPreview";
export type {
  IntegratedRegistrationPreviewField,
  IntegratedRegistrationPreviewProps,
  IntegratedRegistrationPreviewStep,
} from "./registration/integrated-registration-preview/IntegratedRegistrationPreview";
export { default as IntegratedRegistrationComplete } from "./registration/integrated-registration-complete/IntegratedRegistrationComplete";
export type {
  IntegratedRegistrationCompleteProps,
  IntegratedRegistrationCompleteResult,
} from "./registration/integrated-registration-complete/IntegratedRegistrationComplete";
export { default as UserManagementHome } from "./user-management/UserManagementHome";
export type {
  UserManagementAction,
  UserManagementHomeProps,
} from "./user-management/UserManagementHome";
export { default as UserList } from "./user-management/UserList";
export type { UserListProps } from "./user-management/UserList";
export { default as UserRegistration } from "./user-management/UserRegistration";
export type {
  UserRegistrationData,
  UserRegistrationProps,
} from "./user-management/UserRegistration";
export { default as UserDeletion } from "./user-management/UserDeletion";
export type {
  UserAccountRecord,
  UserDeletionProps,
} from "./user-management/UserDeletion";
export { default as UserManagementComplete } from "./user-management/UserManagementComplete";
export type {
  UserManagementCompleteProps,
  UserManagementCompletionAction,
  UserManagementCompletionDetail,
} from "./user-management/UserManagementComplete";
export { default as useScrollToTopOnChange } from "./hooks/useScrollToTopOnChange";
export { default as useAuthSession } from "./hooks/useAuthSession";
export type { AuthSessionState } from "./hooks/useAuthSession";

// 앱 간 공유 페이지 (API 연동 포함)
export { default as LoginPage } from "./pages/LoginPage";
export type { LoginPageProps } from "./pages/LoginPage";
export { default as StaffCareerCertificateIssuePage } from "./pages/StaffCareerCertificateIssuePage";
export { default as StaffCareerEditPage } from "./pages/StaffCareerEditPage";
