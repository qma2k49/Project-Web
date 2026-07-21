import React from "react";

const StatCard = ({
  title,
  value,
  badgeText,
  badgeType = "neutral", // "emerald", "red", "neutral"
  icon: Icon,
  iconBg = "bg-slate-900 text-white",
  progressLine,
}) => {
  const getBadgeStyle = () => {
    switch (badgeType) {
      case "emerald":
        return "bg-emerald-100 text-emerald-700 font-semibold";
      case "red":
        return "bg-rose-100 text-rose-600 font-bold flex items-center gap-1.5";
      case "neutral":
      default:
        return "text-slate-500 font-medium text-xs";
    }
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
      {/* Top Header Row */}
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} shadow-sm`}
        >
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {badgeText && (
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${getBadgeStyle()}`}>
            {badgeType === "red" && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            )}
            {badgeText}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          {title}
        </p>
        <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
          {value}
        </h3>
      </div>

      {/* Optional bottom load line indicator */}
      {progressLine && (
        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: progressLine }}
          />
        </div>
      )}
    </div>
  );
};

export default StatCard;
