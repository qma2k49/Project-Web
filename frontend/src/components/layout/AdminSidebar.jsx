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
            QLBongDa
          </span>
        </div>

        {/* User Profile Info Card */}
        <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-xl p-3 mb-6 flex items-center gap-3 relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Admin Avatar"
            className="w-10 h-10 rounded-lg object-cover border border-emerald-200"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              Cổng quản trị
            </h4>
            <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Giám sát giải đấu
            </p>
          </div>
          <span className="text-[10px] text-gray-400 font-mono absolute bottom-1 right-2">
            v2.4.0
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

      {/* Bottom Action Menu */}
      <div className="pt-4 border-t border-gray-200/80 space-y-1">
        <button
          onClick={() => alert("Đang đăng xuất...")}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
