import React, { useState } from "react";
import { Tv, Radio, ArrowUpRight, Database, Calendar, Shield, MapPin, User, Trophy } from "lucide-react";
import LiveClock from "../admin/LiveClock";
import { fetchMatchById } from "../../api";
import { Modal, Timeline, Spin, Empty, Badge } from "antd";

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

const OngoingMatches = ({
  matches = [],
  onLiveControl,
  loading = false,
  title = "Trận đấu đang/sắp diễn ra",
  showControlBtn = true
}) => {
  // Modal & event details states
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [matchEvents, setMatchEvents] = useState([]);

  const handleMatchClick = async (match) => {
    setSelectedMatch(match);
    setIsEventsModalOpen(true);
    setLoadingEvents(true);
    setMatchEvents([]);
    try {
      const data = await fetchMatchById(match._id || match.id);
      // Backend returns { match, events, lineup }
      // Sort events chronologically (minute ascending)
      const sortedEvents = (data.events || []).sort((a, b) => (a.minute || 0) - (b.minute || 0));
      setMatchEvents(sortedEvents);
    } catch (err) {
      console.error("Lỗi tải diễn biến trận đấu:", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const renderEventIcon = (type) => {
    switch (type) {
      case "Goal":
      case "OwnGoal":
        return <span className="text-base select-none">⚽</span>;
      case "YellowCard":
        return <span className="text-base select-none">🟨</span>;
      case "RedCard":
        return <span className="text-base select-none">🟥</span>;
      case "Substitution":
        return <span className="text-base select-none">🔄</span>;
      case "StartHalf":
      case "EndHalf":
        return <span className="text-base select-none">⏱️</span>;
      default:
        return <span className="text-base select-none">•</span>;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case "Goal":
        return "green";
      case "YellowCard":
        return "gold";
      case "RedCard":
      case "OwnGoal":
        return "red";
      case "Substitution":
        return "blue";
      default:
        return "gray";
    }
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          {title}
        </h3>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
          {matches.length} Trận đấu
        </span>
      </div>

      {/* Body Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-semibold text-xs flex flex-col items-center gap-2">
            <Spin size="small" />
            <span>Đang tải thông tin trận đấu...</span>
          </div>
        ) : matches.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-medium text-xs">
            Không có trận đấu nào trong danh sách này.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-gray-100 text-xs">
              {matches.map((match) => {
                const homeName = getTeamDisplayName(match.homeTeam);
                const awayName = getTeamDisplayName(match.awayTeam);
                const homeLogo = getTeamLogo(match.homeTeam);
                const awayLogo = getTeamLogo(match.awayTeam);

                const leagueName = typeof match.tournamentId === "object" ? match.tournamentId?.name : "ASEAN Hyundai Cup";
                const stadiumName = typeof match.stadium === "object" ? match.stadium?.name : "Sân thi đấu";
                const isLive = match.status === "LIVE";

                return (
                  <tr 
                    key={match._id || match.id} 
                    onClick={() => handleMatchClick(match)}
                    className="hover:bg-slate-50/90 transition-colors align-middle cursor-pointer select-none"
                    title="Click để xem diễn biến chi tiết trận đấu"
                  >
                    {/* Match Details */}
                    <td className="py-4 px-6 align-middle">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-2.5 py-2 border border-slate-100/80 flex-1 min-w-0">
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

                          <div className="flex min-w-[74px] items-center justify-center rounded-full border border-emerald-100 bg-emerald-55 px-3 py-1 text-sm font-black text-[#05241b] whitespace-nowrap shadow-3xs">
                            {match.homeScore ?? 0} - {match.awayScore ?? 0}
                          </div>

                          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-2.5 py-2 border border-slate-100/80 flex-1 min-w-0 justify-end">
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

                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" /> {leagueName} • <MapPin className="w-3.5 h-3.5 text-slate-350" /> {stadiumName}
                        </p>
                      </div>
                    </td>

                    {/* Time / Status */}
                    <td className="py-4 px-4 align-middle">
                      <div className="flex justify-center items-center w-[140px] mx-auto">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1.5 font-bold text-rose-600 text-xs bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                            TRỰC TIẾP • <LiveClock match={match} showIcon={false} />
                          </span>
                        ) : (
                          <span className="font-bold text-slate-450 text-[10px] px-2.5 py-1 rounded-full bg-slate-100 uppercase tracking-wider border border-slate-200/50">
                            {match.status === "FINISHED" ? "KẾT THÚC" : "CHƯA ĐÁ"}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action Button */}
                    {showControlBtn && (
                      <td className="py-4 px-6 align-middle" onClick={(e) => e.stopPropagation()}>
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
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Match Events Details Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
            <span className="font-black text-slate-800 text-sm tracking-tight uppercase">Diễn biến trận đấu chi tiết</span>
          </div>
        }
        open={isEventsModalOpen}
        onCancel={() => {
          setIsEventsModalOpen(false);
          setSelectedMatch(null);
        }}
        footer={null}
        centered
        width={480}
      >
        {selectedMatch && (
          <div className="my-4">
            {/* Header match scores */}
            <div className="flex items-center justify-between py-4 px-4 bg-[#05241b] rounded-2xl text-white mb-6 border border-emerald-950 shadow-sm">
              <div className="text-center flex-1 truncate">
                <span className="font-extrabold text-xs block truncate uppercase tracking-wider">{getTeamDisplayName(selectedMatch.homeTeam)}</span>
              </div>
              <div className="px-4 text-center">
                <span className="text-xl font-black font-mono tracking-widest text-emerald-400">
                  {selectedMatch.homeScore ?? 0} - {selectedMatch.awayScore ?? 0}
                </span>
                <span className="block text-[9px] text-slate-400 font-bold uppercase mt-1">
                  {selectedMatch.status === "LIVE" ? "TRỰC TIẾP" : selectedMatch.status === "FINISHED" ? "KẾT THÚC" : "CHƯA BẮT ĐẦU"}
                </span>
              </div>
              <div className="text-center flex-1 truncate">
                <span className="font-extrabold text-xs block truncate uppercase tracking-wider">{getTeamDisplayName(selectedMatch.awayTeam)}</span>
              </div>
            </div>

            {/* Stadium details */}
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider space-y-1 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-150/70">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-350" />
                <span>Sân vận động: {selectedMatch.stadium?.name || "Chưa xác định"}</span>
              </div>
              {selectedMatch.refereeId && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-350" />
                  <span>Trọng tài: {selectedMatch.refereeId.name || selectedMatch.refereeId}</span>
                </div>
              )}
            </div>

            {/* Timeline of events */}
            <div className="px-1 py-2 max-h-[320px] overflow-y-auto pr-2">
              {loadingEvents ? (
                <div className="py-12 text-center flex flex-col items-center gap-2">
                  <Spin size="default" />
                  <span className="text-xs text-slate-450 font-semibold">Đang tải diễn biến trực tiếp...</span>
                </div>
              ) : matchEvents.length === 0 ? (
                <Empty description={<span className="text-xs text-slate-400 font-medium">Trận đấu chưa có diễn biến nào được ghi nhận.</span>} className="py-6" />
              ) : (
                <Timeline
                  mode="left"
                  items={matchEvents.map((evt) => ({
                    color: getEventColor(evt.eventType),
                    dot: renderEventIcon(evt.eventType),
                    children: (
                      <div className="flex flex-col gap-0.5 pb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                            {evt.minute}'{evt.stoppageMinute > 0 ? `+${evt.stoppageMinute}` : ""}
                          </span>
                          <span className="font-extrabold text-[10px] text-slate-800 uppercase tracking-wider">
                            {evt.eventType === "Goal" ? "BÀN THẮNG" :
                             evt.eventType === "OwnGoal" ? "BÀN PHẢN LƯỚI" :
                             evt.eventType === "YellowCard" ? "THẺ VÀNG" :
                             evt.eventType === "RedCard" ? "THẺ ĐỎ" :
                             evt.eventType === "Substitution" ? "THAY NGƯỜI" :
                             evt.eventType === "StartHalf" ? "BẮT ĐẦU HIỆP ĐẤU" :
                             evt.eventType === "EndHalf" ? "KẾT THÚC HIỆP ĐẤU" : evt.eventType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">{evt.note || ""}</p>
                      </div>
                    )
                  }))}
                />
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OngoingMatches;
