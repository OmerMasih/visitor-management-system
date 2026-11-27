import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import VisitorRegistration from "./pages/VisitorRegistration";
import AdminDashboard from "./pages/AdminDashboard";
import VisitorHistory from "./pages/VisitorHistory";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminSettings from "./pages/AdminSettings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Homepage: Dashboard for logged-in users */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Public Visitor Registration */}
        <Route path="/register" element={<VisitorRegistration />} />

        {/* Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Settings: ADMIN ONLY */}
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        {/* Visitor History */}
        <Route
          path="/admin/history"
          element={
            <ProtectedRoute>
              <VisitorHistory />
            </ProtectedRoute>
          }
        />

        {/* Reports */}
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* Analytics */}
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* Unknown addresses */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
