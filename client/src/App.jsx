import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import VisitorRegistration from "./pages/VisitorRegistration";
import AdminDashboard from "./pages/AdminDashboard";
import VisitorHistory from "./pages/VisitorHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VisitorRegistration />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/admin/history" element={<VisitorHistory />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
