import React from "react";
import { Spin, Tooltip, Progress } from "antd";
import { Trophy, Goal, Users, Shield } from "lucide-react";

const UserStatsView = ({
  loadingStats = false,
  stats = { scorers: [], assists: [], cards: [] },
  maxGoals = 10,
  maxAssists = 10,
  maxYellowCards = 5
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs">
      <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
        <Trophy className="w-5.5 h-5.5 text-amber-505" />
        Thống kê thành tích xuất sắc
      </h3>

      {loadingStats ? (
        <div className="py-12 text-center">
          <Spin size="default" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Scorers */}
          <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-5 hover:shadow-md transition-all duration-300">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 mb-4 uppercase tracking-wider border-b border-slate-100 pb-2">
              <Goal className="w-4 h-4 text-emerald-600" /> Vua phá lưới
            </h4>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 font-bold uppercase border-b border-slate-100 pb-2">
                  <th className="py-2 w-8 text-center">#</th>
                  <th className="py-2">Cầu thủ</th>
                  <th className="py-2 text-center w-12">Bàn thắng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stats.scorers.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-slate-400">Chưa có số liệu.</td>
                  </tr>
                ) : (
                  stats.scorers.slice(0, 10).map((s, idx) => {
                    const goals = s.goals || 0;
                    const percent = maxGoals > 0 ? (goals / maxGoals) * 100 : 0;
                    return (
                      <tr key={s._id} className="hover:bg-slate-100/50">
                        <td className="py-2.5 text-center font-bold text-slate-550">{idx + 1}</td>
                        <td className="py-2.5 pr-2">
                          <div className="font-bold text-slate-805">{s.playerId?.name || "Cầu thủ"}</div>
                          <div className="text-[10px] text-slate-400">{s.teamId?.name || "CLB"}</div>
                          <Tooltip title={`${goals} bàn thắng`}>
                            <Progress
                              percent={percent}
                              showInfo={false}
                              strokeColor={{ '0%': '#10b981', '100%': '#059669' }}
                              size="small"
                              className="mt-1"
                            />
                          </Tooltip>
                        </td>
                        <td className="py-2.5 text-center font-black text-emerald-600 font-mono text-sm">{goals}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Top Assists */}
          <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-5 hover:shadow-md transition-all duration-300">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 mb-4 uppercase tracking-wider border-b border-slate-100 pb-2">
              <Users className="w-4 h-4 text-blue-600" /> Kiến tạo hàng đầu
            </h4>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 font-bold uppercase border-b border-slate-100 pb-2">
                  <th className="py-2 w-8 text-center">#</th>
                  <th className="py-2">Cầu thủ</th>
                  <th className="py-2 text-center w-12">Kiến tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stats.assists.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-slate-400">Chưa có số liệu.</td>
                  </tr>
                ) : (
                  stats.assists.slice(0, 10).map((s, idx) => {
                    const assists = s.assists || 0;
                    const percent = maxAssists > 0 ? (assists / maxAssists) * 100 : 0;
                    return (
                      <tr key={s._id} className="hover:bg-slate-100/50">
                        <td className="py-2.5 text-center font-bold text-slate-550">{idx + 1}</td>
                        <td className="py-2.5 pr-2">
                          <div className="font-bold text-slate-805">{s.playerId?.name || "Cầu thủ"}</div>
                          <div className="text-[10px] text-slate-400">{s.teamId?.name || "CLB"}</div>
                          <Tooltip title={`${assists} kiến tạo`}>
                            <Progress
                              percent={percent}
                              showInfo={false}
                              strokeColor={{ '0%': '#3b82f6', '100%': '#2563eb' }}
                              size="small"
                              className="mt-1"
                            />
                          </Tooltip>
                        </td>
                        <td className="py-2.5 text-center font-black text-blue-600 font-mono text-sm">{assists}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Card Statistics */}
          <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-5 hover:shadow-md transition-all duration-300">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 mb-4 uppercase tracking-wider border-b border-slate-100 pb-2">
              <Shield className="w-4 h-4 text-amber-500" /> Thống kê thẻ phạt
            </h4>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 font-bold uppercase border-b border-slate-100 pb-2">
                  <th className="py-2 w-8 text-center">#</th>
                  <th className="py-2">Cầu thủ</th>
                  <th className="py-2 text-center w-12">Vàng</th>
                  <th className="py-2 text-center w-12">Đỏ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stats.cards.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-slate-400">Chưa có số liệu.</td>
                  </tr>
                ) : (
                  stats.cards.slice(0, 10).map((s, idx) => {
                    const yellow = s.yellowCards || 0;
                    const red = s.redCards || 0;
                    const percent = maxYellowCards > 0 ? (yellow / maxYellowCards) * 100 : 0;
                    return (
                      <tr key={s._id} className="hover:bg-slate-100/50">
                        <td className="py-2.5 text-center font-bold text-slate-550">{idx + 1}</td>
                        <td className="py-2.5 pr-2">
                          <div className="font-bold text-slate-805">{s.playerId?.name || "Cầu thủ"}</div>
                          <div className="text-[10px] text-slate-400">{s.teamId?.name || "CLB"}</div>
                          <Tooltip title={`${yellow} thẻ vàng`}>
                            <Progress
                              percent={percent}
                              showInfo={false}
                              strokeColor={{ '0%': '#facc15', '100%': '#eab308' }}
                              size="small"
                              className="mt-1"
                            />
                          </Tooltip>
                        </td>
                        <td className="py-2.5 text-center font-bold text-amber-500 font-mono text-sm">{yellow}</td>
                        <td className="py-2.5 text-center font-black text-rose-600 font-mono text-sm">{red}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStatsView;
