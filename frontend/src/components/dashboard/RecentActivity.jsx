import React from "react";
import {
  Calendar,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  Activity
} from "lucide-react";


const renderIcon = (type) => {
  switch (type) {
    case "calendar":
      return <Calendar className="w-4 h-4" />;
    case "user":
      return <UserPlus className="w-4 h-4" />;
    case "alert":
      return <AlertTriangle className="w-4 h-4" />;
    case "check":
    default:
      return <CheckCircle2 className="w-4 h-4" />;
  }
};

const RecentActivity = ({ activities = [], onClearHistory }) => {
  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between h-full">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center gap-3">
        <Activity className="w-5 h-5 text-slate-800" />
        <h2 className="text-lg font-bold text-slate-900">Hoạt động gần đây</h2>
      </div>

      {/* Timeline List */}
      <div className="p-5 flex-1 space-y-6 relative">
        {activities.map((act, index) => (
          <div key={act.id} className="relative flex items-start gap-3.5">
            {/* Vertical Connecting Line */}
            {index !== activities.length - 1 && (
              <span className="absolute left-4 top-8 -bottom-6 w-0.5 bg-gray-100" />
            )}

            {/* Icon Box */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${act.iconBg}`}
            >
              {renderIcon(act.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {act.title}
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                {act.description}
              </p>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1 block">
                {act.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Button */}
      <div className="p-4 bg-slate-50/60 border-t border-gray-100 text-center">
        <button
          onClick={onClearHistory}
          className="w-full py-2 px-4 rounded-xl border border-gray-200 text-xs font-bold tracking-wider text-slate-700 hover:bg-slate-100 transition-colors uppercase"
        >
          Xóa lịch sử hoạt động
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;
