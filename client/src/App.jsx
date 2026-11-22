import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import VisitorRegistration from "./pages/VisitorRegistration";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Visitor registration page */}
        <Route path="/" element={<VisitorRegistration />} />

        {/* Security admin dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Redirect unknown pages */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
