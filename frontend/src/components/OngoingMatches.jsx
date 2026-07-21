import React from "react";
import { Tv, Radio, ArrowUpRight, Database } from "lucide-react";

const getTeamDisplayName = (team) => {
  if (!team) return "—";
  if (typeof team === "object") {
    return team.shortName || team.name || "Đội bóng";
  }
  return String(team).substring(0, 5);
};

const getTeamLogo = (team) => {
  if (team && typeof team === "object" && team.logo) {
    return team.logo;
  }
  return null;
};

const OngoingMatches = ({ matches = [], onLiveControl, loading = false }) => {
  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Trận đấu đang/sắp diễn ra
            </h2>
          </div>
        </div>
        <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1">
          Xem toàn bộ lịch trình
        </button>
      </div>

      {/* Table List */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium text-xs">
            Đang tải dữ liệu thực từ MongoDB...
          </div>
        ) : matches.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium text-xs">
            Chưa có trận đấu nào trong cơ sở dữ liệu. Vui lòng bấm "+ Trận đấu mới" để thêm.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-3 px-6">Chi tiết trận đấu</th>
                <th className="py-3 px-4 text-center w-[140px]">Trạng thái</th>
                <th className="py-3 px-6 text-center w-[220px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {matches.map((match) => {
                const homeName = getTeamDisplayName(match.homeTeam);
                const awayName = getTeamDisplayName(match.awayTeam);
                const homeLogo = getTeamLogo(match.homeTeam);
                const awayLogo = getTeamLogo(match.awayTeam);

                const leagueName = typeof match.tournamentId === "object" ? match.tournamentId?.name : "V.League 1";
                const stadiumName = typeof match.stadium === "object" ? match.stadium?.name : "Sân thi đấu";
                const isLive = match.status === "LIVE";

                return (
                  <tr key={match._id || match.id} className="hover:bg-slate-50/80 transition-colors align-middle">
                    {/* Match Details */}
                    <td className="py-4 px-6 align-middle">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-2.5 py-2 border border-slate-100 flex-1 min-w-0">
                            {homeLogo ? (
                              <img src={homeLogo} alt={homeName} className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-800">
                                {homeName.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm font-semibold text-slate-800 uppercase tracking-wide truncate">
                              {homeName}
                            </span>
                          </div>

                          <div className="flex min-w-[74px] items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700 whitespace-nowrap">
                            {match.homeScore ?? 0} - {match.awayScore ?? 0}
                          </div>

                          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-2.5 py-2 border border-slate-100 flex-1 min-w-0 justify-end">
                            <span className="text-sm font-semibold text-slate-800 uppercase tracking-wide truncate text-right">
                              {awayName}
                            </span>
                            {awayLogo ? (
                              <img src={awayLogo} alt={awayName} className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                                {awayName.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 font-medium">
                          {leagueName} • {stadiumName}
                        </p>
                      </div>
                    </td>

                    {/* Time / Status */}
                    <td className="py-4 px-4 align-middle">
                      <div className="flex justify-center items-center w-[140px] mx-auto">
                      {isLive ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-600 text-xs bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                          TRỰC TIẾP
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-500 text-xs px-2.5 py-1 rounded-full bg-slate-100">
                          {match.status === "FINISHED" ? "KẾT THÚC" : "CHƯA BẮT ĐẦU"}
                        </span>
                      )}
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-4 px-6 align-middle">
                      <div className="flex justify-center items-center w-[220px] mx-auto">
                      <button
                        onClick={() => onLiveControl && onLiveControl(match)}
                        className="inline-flex items-center justify-center gap-2 bg-[#054432] hover:bg-[#033224] text-emerald-400 font-semibold px-4 py-2 rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
                      >
                        <Radio className="w-3.5 h-3.5 text-emerald-400" />
                        Điều khiển trực tiếp
                      </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer CTA Banner */}
      <div className="p-4 bg-slate-50/60 border-t border-gray-100 text-center">
        <button className="text-xs font-extrabold tracking-wider text-emerald-700 hover:text-emerald-800 transition-colors uppercase inline-flex items-center gap-1.5">
          Mở bảng điều khiển đa trận đấu
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default OngoingMatches;
