import React, { useState } from "react";
import { Radio, PlayCircle, Clock3, ArrowRight, Trophy, Users } from "lucide-react";
import PageHeader from "./PageHeader";
import MatchLineupModal from "./modals/MatchLineupModal";
import LiveClock from "./LiveClock";

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

const LiveControlView = ({ loading = false, matches = [], players = [], onOpenLiveControl, onBack }) => {
  const [selectedLineupMatch, setSelectedLineupMatch] = useState(null);
  const [isLineupModalOpen, setIsLineupModalOpen] = useState(false);

  const handleOpenLineupModal = (match) => {
    setSelectedLineupMatch(match);
    setIsLineupModalOpen(true);
  };

  const liveMatches = (matches || []).filter((match) => match.status === "LIVE");
  const upcomingMatches = (matches || []).filter((match) => match.status !== "LIVE" && match.status !== "FINISHED");

  return (
    <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
      <PageHeader
        title="Điều khiển trực tiếp"
        description="Theo dõi, mở bảng điều khiển và ghi nhận sự kiện cho các trận đang diễn ra."
      />

      <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-white">
              <Radio className="w-3.5 h-3.5" />
              Live Ops Center
            </div>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">Trung tâm điều phối trận đấu</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Giao diện này tập trung vào việc kiểm soát trận live, theo dõi nhanh trạng thái và gửi sự kiện vào hệ thống.
            </p>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Tổng quan hôm nay</div>
            <div className="mt-2 flex items-center gap-4 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-emerald-600" />
                <span>{liveMatches.length} trận đang live</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-slate-500" />
                <span>{upcomingMatches.length} trận sắp diễn ra</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Trophy className="w-4 h-4 text-emerald-600" />
            Trận live hiện có
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">{liveMatches.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Clock3 className="w-4 h-4 text-slate-500" />
            Trận sắp diễn ra
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">{upcomingMatches.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Radio className="w-4 h-4 text-rose-500" />
            Hành động nhanh
          </div>
          <div className="mt-3 text-sm text-slate-600">Mở bảng điều khiển ngay từ danh sách trận để ghi nhận bàn thắng, thẻ, thay người và bắt đầu hiệp.</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 bg-slate-50/70">
          <h3 className="text-base font-bold text-slate-900">Danh sách trận đấu</h3>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Đang tải dữ liệu trận đấu từ hệ thống...</div>
        ) : matches.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">Chưa có trận đấu nào để điều khiển.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {matches.map((match) => {
              const homeName = getTeamDisplayName(match.homeTeam);
              const awayName = getTeamDisplayName(match.awayTeam);
              const homeLogo = getTeamLogo(match.homeTeam);
              const awayLogo = getTeamLogo(match.awayTeam);
              const isLive = match.status === "LIVE";
              const matchDate = match.matchDate || match.date || match.startTime || "";
              const venueName = match.stadium?.name || match.stadiumName || match.venue || "Chưa cập nhật địa điểm";
              const formattedMatchDate = matchDate
                ? new Date(matchDate).toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
                : "Chưa có thời gian";

              return (
                <div key={match._id || match.id} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      {isLive ? (
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] bg-rose-50 text-rose-600">
                          Đang trực tiếp • <LiveClock match={match} showIcon={false} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] bg-slate-100 text-slate-600">
                          {match.status === "FINISHED" ? "Đã kết thúc" : "Sắp diễn ra"}
                        </span>
                      )}
                      <span className="text-sm text-slate-500">
                        {typeof match.tournamentId === "object" ? match.tournamentId?.name : "V.League"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 min-w-[180px]">
                        {homeLogo ? (
                          <img src={homeLogo} alt={homeName} className="h-7 w-7 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                            {homeName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="font-semibold text-slate-800">{homeName}</span>
                      </div>

                      <div className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-black text-white">
                        {match.homeScore ?? 0} - {match.awayScore ?? 0}
                      </div>

                      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 min-w-[180px] justify-end">
                        <span className="font-semibold text-slate-800">{awayName}</span>
                        {awayLogo ? (
                          <img src={awayLogo} alt={awayName} className="h-7 w-7 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                            {awayName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1">
                        <Clock3 className="w-3.5 h-3.5" />
                        {formattedMatchDate}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1">
                        <Trophy className="w-3.5 h-3.5" />
                        {venueName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleOpenLineupModal(match)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 border border-gray-200 text-sm shadow-xs transition-colors cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-slate-500" />
                      Cài đặt đội hình
                    </button>
                    <button
                      onClick={() => onOpenLiveControl && onOpenLiveControl(match)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 cursor-pointer"
                    >
                      <Radio className="w-4 h-4" />
                      Điều khiển trực tiếp
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MatchLineupModal
        visible={isLineupModalOpen}
        onClose={() => setIsLineupModalOpen(false)}
        match={selectedLineupMatch}
        players={players}
      />
    </main>
  );
};

export default LiveControlView;
