import { createBrowserRouter } from "react-router";
import { AdminLayout } from "@/app/layouts/AdminLayout";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { ProtectedRoute } from "@/features/authentication/protected-route";
import { ZoneDashboardPage } from "@/pages/admin/ZoneDashboardPage";
import { ZoneParticipantsPage } from "@/pages/admin/ZoneParticipantsPage";
import { ZoneBulkUploadPage } from "@/pages/admin/ZoneBulkUploadPage";
import { ZoneImportHistoryPage } from "@/pages/admin/ZoneImportHistoryPage";
import { GuardianDetailPage } from "@/pages/admin/GuardianDetailPage";
import { GuardianResponsePage } from "@/pages/admin/GuardianResponsePage";
import { ProvisioningPage } from "@/pages/admin/ProvisioningPage";
import { HqDashboardPage } from "@/pages/admin/HqDashboardPage";
import { GuardianConsentPage } from "@/pages/admin/GuardianConsentPage";
import { HqGuardianResponsePage } from "@/pages/admin/HqGuardianResponsePage";
import { ImportTemplatePage } from "@/pages/admin/ImportTemplatePage";
import { KingsPassExportPage } from "@/pages/admin/KingsPassExportPage";
import { ExportHistoryPage } from "@/pages/admin/ExportHistoryPage";
import { NotificationTemplatesPage } from "@/pages/admin/NotificationTemplatesPage";
import { NotificationQueuePage } from "@/pages/admin/NotificationQueuePage";
import { KingsChatIntegrationPage } from "@/pages/admin/KingsChatIntegrationPage";
import { HomePage } from "@/pages/public/HomePage";
import { AboutPage } from "@/pages/public/AboutPage";
import { PreparationPage } from "@/pages/public/PreparationPage";
import { FAQsPage } from "@/pages/public/FAQsPage";
import { HighlightsPage } from "@/pages/public/HighlightsPage";
import { ContactPage } from "@/pages/public/ContactPage";
import { LoginPage } from "@/pages/public/LoginPage";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { RegisterPage } from "@/pages/public/RegisterPage";
import { RegistrationSuccessPage } from "@/pages/public/RegistrationSuccessPage";
import { GuardianPublicResponsePage } from "@/pages/public/GuardianPublicResponsePage";
import { AdminLoginPage } from "@/pages/public/AdminLoginPage";

/**
 * Route architecture.
 * - Public routes: /, /about, /preparation, /faqs, /highlights, /contact, /register, /login
 * - Protected routes: /hq/* (hq_admin only), /zone/* (zone_admin only)
 * - Real data security is enforced by Supabase RLS, not by these routes.
 */
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "preparation", element: <PreparationPage /> },
      { path: "faqs", element: <FAQsPage /> },
      { path: "highlights", element: <HighlightsPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "register/success", element: <RegistrationSuccessPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "guardian/respond/:token", element: <GuardianPublicResponsePage /> },
      { path: "admin", element: <AdminLoginPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "hq",
    element: (
      <ProtectedRoute allowedRoles={["hq_admin"]}>
        <AdminLayout area="hq" />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HqDashboardPage /> },
      { path: "provisioning", element: <ProvisioningPage /> },
      { path: "guardian-consent", element: <GuardianConsentPage /> },
      { path: "guardian-responses", element: <HqGuardianResponsePage /> },
      { path: "import-templates", element: <ImportTemplatePage /> },
      { path: "kingspass-export", element: <KingsPassExportPage /> },
      { path: "export-history", element: <ExportHistoryPage /> },
      { path: "notification-templates", element: <NotificationTemplatesPage /> },
      { path: "notification-queue", element: <NotificationQueuePage /> },
      { path: "kingschat-integration", element: <KingsChatIntegrationPage /> },
    ],
  },
  {
    path: "zone",
    element: (
      <ProtectedRoute allowedRoles={["zone_admin"]}>
        <AdminLayout area="zone" />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <ZoneDashboardPage /> },
      { path: "participants", element: <ZoneParticipantsPage /> },
      { path: "bulk-upload", element: <ZoneBulkUploadPage /> },
      { path: "import-history", element: <ZoneImportHistoryPage /> },
      { path: "guardians/:registrationId", element: <GuardianDetailPage /> },
      { path: "guardian-responses", element: <GuardianResponsePage /> },
      { path: "export-history", element: <ExportHistoryPage /> },
      { path: "notification-queue", element: <NotificationQueuePage /> },
    ],
  },
]);
