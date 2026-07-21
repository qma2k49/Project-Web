import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import AdminPage from "./pages/AdminPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
