import React from "react";
import { Select, Spin } from "antd";
import { Award } from "lucide-react";

const UserLeaderboardView = ({
  tournaments = [],
  leaderboard = [],
  leaderboardTournamentId = null,
  setLeaderboardTournamentId,
  loadingLeaderboard = false
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4 mb-6">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <Award className="w-5.5 h-5.5 text-amber-500" />
          Bảng xếp hạng dự đoán
        </h3>
        {tournaments && tournaments.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Giải đấu:</span>
            <Select
              value={leaderboardTournamentId || (tournaments[0]._id || tournaments[0].id)}
              onChange={(val) => setLeaderboardTournamentId(val)}
              style={{ width: 200 }}
              className="font-bold text-slate-700"
              options={tournaments.map(t => ({
                label: t.name,
                value: t._id || t.id
              }))}
            />
          </div>
        )}
      </div>

      {loadingLeaderboard ? (
        <div className="py-16 text-center">
          <Spin size="large" />
          <span className="block text-xs text-slate-400 mt-2 font-semibold">Đang tải bảng xếp hạng...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase">
                <th className="py-3 px-2 w-16 text-center">Hạng</th>
                <th className="py-3 px-4">Thành viên</th>
                <th className="py-3 px-4 text-center w-24 font-bold text-slate-800">Điểm số</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-slate-400">Chưa có bảng xếp hạng.</td>
                </tr>
              ) : (
                leaderboard.map((row, idx) => {
                  const uName = (row.userId?.userName || row.accountId?.userName || "Thành viên").split("@")[0];
                  return (
                    <tr key={row._id || idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-2 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                          idx === 0 ? "bg-amber-400 text-[#05241b]" :
                            idx === 1 ? "bg-slate-300 text-slate-800" :
                              idx === 2 ? "bg-amber-600 text-white" : "text-slate-400"
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{uName}</td>
                      <td className="py-3.5 px-4 text-center font-black text-emerald-700 font-mono text-base">{row.totalPoints || row.totalScore || 0}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserLeaderboardView;
