import React from "react";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Building2,
  UserCheck,
  Radio,
  Settings,
  LogOut,
  Sparkles
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { id: "leagues", label: "Giải đấu", icon: Trophy },
  { id: "teams", label: "Đội bóng", icon: Users },
  { id: "stadiums", label: "Sân vận động", icon: Building2 },
  { id: "personnel", label: "Cầu thủ / Huấn luyện viên", icon: UserCheck },
  { id: "live", label: "Điều khiển trực tiếp", icon: Radio },
  { id: "predictions", label: "Dự đoán", icon: Sparkles },
];

const AdminSidebar = ({ activeTab = "dashboard", onTabChange }) => {
  return (
    <aside className="w-64 bg-[#f8faf9] border-r border-gray-200 min-h-screen flex flex-col justify-between p-4 font-sans select-none">
      {/* Top Header & Navigation */}
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 px-2 py-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-400 flex items-center justify-center text-slate-900 shadow-sm">
            <Trophy className="w-5 h-5 text-slate-900 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            Football Zone
          </span>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange && onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                  ? "bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-400/20 font-bold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>


    </aside>
  );
};

export default AdminSidebar;
