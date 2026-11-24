import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import VisitorRegistration from "./pages/VisitorRegistration";
import AdminDashboard from "./pages/AdminDashboard";
import VisitorHistory from "./pages/VisitorHistory";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public visitor registration */}
        <Route path="/" element={<VisitorRegistration />} />

        {/* Administrator login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected administrator pages */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/history"
          element={
            <ProtectedRoute>
              <VisitorHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
