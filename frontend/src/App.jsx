import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import AdminPage from "./pages/AdminPage";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Lỗi parse user từ localStorage:", e);
  }

  if (!token || !user || user.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Route guard for User dashboard
const UserRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<HomePage />} />

        {/* Authentication Login/Register Page */}
        <Route path="/login" element={<AuthPage />} />

        {/* Protected User Dashboard */}
        <Route path="/user" element={
          <UserRoute>
            <UserDashboardPage />
          </UserRoute>
        } />

        {/* Protected Admin Dashboard */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        } />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
