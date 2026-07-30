import React, { useState, useEffect } from "react";
import { LogOut } from "lucide-react";

const AdminHeader = ({ title = "Bảng quản trị" }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const userStr = localStorage.getItem("user");
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Error parsing user from localStorage:", e);
  }

  useEffect(() => {
    if (!dropdownOpen) return;
    const closeDropdown = () => setDropdownOpen(false);
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, [dropdownOpen]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="text-slate-800 font-extrabold text-sm uppercase tracking-wider">{title}</div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* User Profile Avatar with dropdown */}
        <div className="relative flex items-center gap-2 pl-2" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-full border-2 border-emerald-500/80 p-0.5 overflow-hidden focus:outline-none hover:ring-2 hover:ring-emerald-400 transition-all cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="User profile"
              className="w-full h-full object-cover rounded-full"
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-64 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xl p-4 space-y-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User Info Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full border border-emerald-100 bg-emerald-50 flex items-center justify-center text-emerald-700 font-extrabold text-sm uppercase">
                  {user?.username?.slice(0, 2) || user?.email?.slice(0, 2) || "AD"}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-800 truncate">{user?.username || user?.name || "Quản trị viên"}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email || "admin@system.com"}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-emerald-50/50 border border-emerald-100/50 rounded-xl">
                <span className="text-slate-500 font-medium">Vai trò tài khoản:</span>
                <span className="font-extrabold text-emerald-700 uppercase tracking-wider text-[10px] bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  {user?.role || "ADMIN"}
                </span>
              </div>

              {/* Actions List */}
              <div className="space-y-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-semibold text-xs text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất tài khoản
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
