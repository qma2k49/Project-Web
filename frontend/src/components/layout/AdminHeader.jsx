import React from "react";
import { Search, Bell, LogOut } from "lucide-react";

const AdminHeader = ({ title = "Bảng quản trị" }) => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="text-slate-800 font-extrabold text-sm uppercase tracking-wider">{title}</div>

      {/* Right Actions (Search, Notification, Profile) */}
      <div className="flex items-center gap-4">
        

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Log Out */}
        <button
          onClick={handleLogout}
          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          title="Đăng xuất"
        >
          <LogOut className="w-5 h-5" />
        </button>

        {/* User Profile Avatar Pill */}
        <div className="flex items-center gap-2 pl-2">
          <button className="w-9 h-9 rounded-full border-2 border-emerald-500/80 p-0.5 overflow-hidden focus:outline-none hover:ring-2 hover:ring-emerald-400 transition-all">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="User profile"
              className="w-full h-full object-cover rounded-full"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
