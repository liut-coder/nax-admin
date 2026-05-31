import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { BlankLayout } from "@/components/layout/BlankLayout";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ProtectedRoute } from "@/routes/guards";

const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const ForbiddenPage = lazy(() =>
  import("@/pages/ForbiddenPage").then((module) => ({
    default: module.ForbiddenPage,
  })),
);
const LoginPage = lazy(() =>
  import("@/pages/LoginPage").then((module) => ({ default: module.LoginPage })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((module) => ({
    default: module.NotFoundPage,
  })),
);
const DetailExamplePage = lazy(() =>
  import("@/pages/examples/DetailExamplePage").then((module) => ({
    default: module.DetailExamplePage,
  })),
);
const AdminAuditLogsPage = lazy(() =>
  import("@/pages/admin/AdminAuditLogsPage").then((module) => ({
    default: module.AdminAuditLogsPage,
  })),
);
const AdminFilesPage = lazy(() =>
  import("@/pages/admin/AdminFilesPage").then((module) => ({
    default: module.AdminFilesPage,
  })),
);
const AdminPermissionsPage = lazy(() =>
  import("@/pages/admin/AdminPermissionsPage").then((module) => ({
    default: module.AdminPermissionsPage,
  })),
);
const AdminRolesPage = lazy(() =>
  import("@/pages/admin/AdminRolesPage").then((module) => ({
    default: module.AdminRolesPage,
  })),
);
const AdminSettingsPage = lazy(() =>
  import("@/pages/admin/AdminSettingsPage").then((module) => ({
    default: module.AdminSettingsPage,
  })),
);
const AdminUsersPage = lazy(() =>
  import("@/pages/admin/AdminUsersPage").then((module) => ({
    default: module.AdminUsersPage,
  })),
);
const FormExamplePage = lazy(() =>
  import("@/pages/examples/FormExamplePage").then((module) => ({
    default: module.FormExamplePage,
  })),
);
const TableExamplePage = lazy(() =>
  import("@/pages/examples/TableExamplePage").then((module) => ({
    default: module.TableExamplePage,
  })),
);
const WizardExamplePage = lazy(() =>
  import("@/pages/examples/WizardExamplePage").then((module) => ({
    default: module.WizardExamplePage,
  })),
);
function page(element: React.ReactNode) {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <LoadingSkeleton />
        </div>
      }
    >
      {element}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: "/login", element: page(<LoginPage />) }],
  },
  {
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: "/dashboard",
        element: <ProtectedRoute>{page(<DashboardPage />)}</ProtectedRoute>,
      },
      {
        path: "/admin/users",
        element: (
          <ProtectedRoute permission="user:list">
            {page(<AdminUsersPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/roles",
        element: (
          <ProtectedRoute permission="role:list">
            {page(<AdminRolesPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/permissions",
        element: (
          <ProtectedRoute permission="permission:list">
            {page(<AdminPermissionsPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/settings",
        element: (
          <ProtectedRoute permission="setting:list">
            {page(<AdminSettingsPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/audit-logs",
        element: (
          <ProtectedRoute permission="audit:list">
            {page(<AdminAuditLogsPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/files",
        element: (
          <ProtectedRoute permission="file:list">
            {page(<AdminFilesPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "/examples/table",
        element: <ProtectedRoute>{page(<TableExamplePage />)}</ProtectedRoute>,
      },
      {
        path: "/examples/form",
        element: <ProtectedRoute>{page(<FormExamplePage />)}</ProtectedRoute>,
      },
      {
        path: "/examples/detail",
        element: <ProtectedRoute>{page(<DetailExamplePage />)}</ProtectedRoute>,
      },
      {
        path: "/examples/wizard",
        element: <ProtectedRoute>{page(<WizardExamplePage />)}</ProtectedRoute>,
      },
      {
        path: "/settings",
        element: <Navigate to="/admin/settings" replace />,
      },
    ],
  },
  {
    element: <BlankLayout />,
    children: [
      { path: "/403", element: page(<ForbiddenPage />) },
      { path: "/404", element: page(<NotFoundPage />) },
      { path: "*", element: page(<NotFoundPage />) },
    ],
  },
]);
