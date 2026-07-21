import React from "react";
import AdminSidebar from "./AdminSidebar";

const Menu = ({ activeTab, onTabChange }) => {
  return <AdminSidebar activeTab={activeTab} onTabChange={onTabChange} />;
};

export default Menu;