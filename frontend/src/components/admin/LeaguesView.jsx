import React from "react";
import { PageHeader } from "./index";

const LeaguesView = ({ loading, tournaments, matches, teams, stadiums, onBack }) => {
  return (
    <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
      <PageHeader
        title="Danh sách giải đấu"
        description="Quản lý các giải đấu đang hoạt động và theo dõi thông tin ngắn gọn của từng giải."
        action={
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-gray-200 text-xs shadow-xs transition-colors"
          >
            Quay lại tổng quan
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-gray-200 bg-white p-10 text-center text-slate-500">
            Đang tải dữ liệu giải đấu...
          </div>
        ) : tournaments.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-gray-200 bg-white p-10 text-center text-slate-500">
            Chưa có giải đấu nào trong cơ sở dữ liệu.
          </div>
        ) : (
          tournaments.map((tournament) => (
            <div key={tournament._id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{tournament.name}</h2>
                  <p className="text-sm text-slate-500">{tournament.season || "Mùa giải"}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {tournament.status || "Đang hoạt động"}
                </span>
              </div>

              <div className="mt-4 text-sm text-slate-600 space-y-1">
                <p>• Tổng trận đấu: {matches.filter((match) => {
                  const tournamentId = typeof match.tournamentId === "object" ? match.tournamentId?._id : match.tournamentId;
                  return tournamentId === tournament._id;
                }).length}</p>
                <p>• Số đội tham gia: {teams.length}</p>
                <p>• Sân vận động hỗ trợ: {stadiums.length}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
};

export default LeaguesView;
