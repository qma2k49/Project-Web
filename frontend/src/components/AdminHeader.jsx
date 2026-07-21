import React from "react";
import { Search, Bell } from "lucide-react";

const AdminHeader = ({ title = "Bảng quản trị" }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left Logo / Title */}
      <div className="flex items-center gap-4">
        <span className="font-extrabold text-2xl tracking-wider text-emerald-700 italic font-serif">
          PITCHSIDE
        </span>
        <span className="text-gray-300 text-lg">|</span>
        <h1 className="text-sm font-semibold text-slate-600 tracking-wide">
          {title}
        </h1>
      </div>

      {/* Right Actions (Search, Notification, Profile) */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm trận đấu, đội bóng..."
            className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all"
          />
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
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
