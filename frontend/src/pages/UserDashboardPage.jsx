import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { fetchDashboardOverview, fetchMyPredictions, submitPrediction, fetchPredictionLeaderboard, fetchTopScorers, fetchTopAssists, fetchCardStatistics } from "../api";
import { Trophy, Tv, Users, LogOut, RefreshCw, Calendar, Shield, Sparkles, User, Goal, Edit3, Award, MapPin, TrendingUp } from "lucide-react";
import { LeaguesView } from "../components/admin";
import { message, Modal, InputNumber, Spin, Tabs, Progress, Badge, Statistic, Tooltip, Avatar } from "antd";

const UserDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("predict"); // predict, leaderboard, leagues, stats
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    matches: [],
    tournaments: [],
    teams: [],
    stadiums: []
  });

  const [myPredictions, setMyPredictions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [stats, setStats] = useState({
    scorers: [],
    assists: [],
    cards: []
  });

  // Modal prediction states
  const [isPredictionModalOpen, setIsPredictionModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [predictScores, setPredictScores] = useState({ home: 0, away: 0 });
  const [submittingPrediction, setSubmittingPrediction] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let currentUser = null;
  try {
    currentUser = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Lỗi parse currentUser:", e);
  }

  // Protect route
  useEffect(() => {
    if (!token || !currentUser) {
      message.error("Vui lòng đăng nhập để tiếp tục!");
      navigate("/login");
    }
  }, [token, currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      const overview = await fetchDashboardOverview();
      setData(overview);

      // Load my predictions
      if (token) {
        const predictions = await fetchMyPredictions(token);
        setMyPredictions(Array.isArray(predictions) ? predictions : []);
      }

      // Load statistics for first tournament
      if (overview.tournaments && overview.tournaments.length > 0) {
        await loadPlayerStats(overview.tournaments[0]._id || overview.tournaments[0].id);
      }
    } catch (error) {
      message.error("Lỗi tải thông tin giải đấu!");
    } finally {
      setLoading(false);
    }
  };

  const loadPlayerStats = async (tournamentId) => {
    try {
      setLoadingStats(true);
      const [scorers, assists, cards] = await Promise.allSettled([
        fetchTopScorers(tournamentId),
        fetchTopAssists(tournamentId),
        fetchCardStatistics(tournamentId)
      ]);

      setStats({
        scorers: scorers.status === "fulfilled" ? scorers.value : [],
        assists: assists.status === "fulfilled" ? assists.value : [],
        cards: cards.status === "fulfilled" ? cards.value : []
      });
    } catch (err) {
      console.error("Lỗi tải thống kê:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadLeaderboardData = async () => {
    try {
      setLoadingLeaderboard(true);
      const ranking = await fetchPredictionLeaderboard();
      setLeaderboard(Array.isArray(ranking) ? ranking : []);
    } catch (error) {
      message.error("Không thể tải bảng xếp hạng dự đoán!");
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === "leaderboard") {
      loadLeaderboardData();
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    message.success("Đăng xuất thành công!");
    navigate("/");
  };

  const openPredictionModal = (match, existingPrediction) => {
    setSelectedMatch(match);
    setPredictScores({
      home: existingPrediction ? existingPrediction.predictedHomeScore : 0,
      away: existingPrediction ? existingPrediction.predictedAwayScore : 0
    });
    setIsPredictionModalOpen(true);
  };

  const handlePredictionSubmit = async () => {
    if (!selectedMatch) return;
    try {
      setSubmittingPrediction(true);
      const payload = {
        matchId: selectedMatch._id || selectedMatch.id,
        homeScore: predictScores.home,
        awayScore: predictScores.away
      };
      await submitPrediction(payload, token);
      message.success("Lưu dự đoán tỷ số thành công!");
      
      // Reload predictions
      const predictions = await fetchMyPredictions(token);
      setMyPredictions(Array.isArray(predictions) ? predictions : []);
      
      setIsPredictionModalOpen(false);
      setSelectedMatch(null);
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi gửi dự đoán!");
    } finally {
      setSubmittingPrediction(false);
    }
  };

  const getTeamName = (team) => {
    if (!team) return "—";
    return typeof team === "object" ? team.name || team.shortName : team;
  };

  const getTeamLogo = (team) => {
    if (team && typeof team === "object" && team.logo) return team.logo;
    return null;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa xác định";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Chưa xác định";
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  if (!currentUser) return null;

  // Filter matches that are upcoming (NOT STARTED) for prediction
  const upcomingMatches = (data.matches || []).filter(m => m.status === "NOT STARTED");

  // Calculate relative stats progress
  const maxGoals = stats.scorers.length > 0 ? Math.max(...stats.scorers.map(s => s.goals || 0)) : 10;
  const maxAssists = stats.assists.length > 0 ? Math.max(...stats.assists.map(a => a.assists || 0)) : 10;
  const maxYellowCards = stats.cards.length > 0 ? Math.max(...stats.cards.map(c => c.yellowCards || 0)) : 5;

  return (
    <div className="min-h-screen bg-[#f3f7f5] text-slate-900 font-sans antialiased flex flex-col">
      {/* User dashboard header */}
      <header className="bg-[#05241b] text-white border-b border-emerald-950 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl font-bold font-mono">
              ⚽
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none text-emerald-400">ASEAN HYUNDAI CUP</h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 block">Khu Vực Thành Viên</span>
            </div>
          </div>

          {/* User profile & logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="font-extrabold text-xs text-white">{(currentUser.userName || currentUser.username || "User").split("@")[0]}</div>
              <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Thành viên</div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white p-2.5 rounded-xl transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Tabs Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-18 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-6">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            centered
            tabBarStyle={{ marginBottom: 0, borderBottom: 'none' }}
            items={[
              {
                key: "predict",
                label: (
                  <span className="flex items-center gap-2 font-black text-xs uppercase tracking-wider py-1">
                    <Sparkles className="w-4 h-4" /> Dự đoán tỷ số
                  </span>
                )
              },
              {
                key: "leaderboard",
                label: (
                  <span className="flex items-center gap-2 font-black text-xs uppercase tracking-wider py-1">
                    <Award className="w-4 h-4" /> BXH Dự đoán
                  </span>
                )
              },
              {
                key: "leagues",
                label: (
                  <span className="flex items-center gap-2 font-black text-xs uppercase tracking-wider py-1">
                    <Trophy className="w-4 h-4" /> Bảng điểm & Nhánh đấu
                  </span>
                )
              },
              {
                key: "stats",
                label: (
                  <span className="flex items-center gap-2 font-black text-xs uppercase tracking-wider py-1">
                    <Users className="w-4 h-4" /> Thống kê cầu thủ
                  </span>
                )
              }
            ]}
          />
        </div>
      </div>

      {/* Main dashboard content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center gap-3">
            <Spin size="large" />
            <span className="text-slate-400 font-semibold text-xs animate-pulse">Đang tải dữ liệu tài khoản...</span>
          </div>
        ) : (
          <>
            {/* TAB 1: PREDICTIONS PANEL */}
            {activeTab === "predict" && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs">
                  <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <Award className="w-5.5 h-5.5 text-emerald-600" />
                        Dự đoán tỷ số trận đấu sắp diễn ra
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-1">Dự đoán đúng tỷ số nhận ngay 3 điểm, đúng kết quả thắng/hòa nhận 1 điểm tích lũy.</p>
                    </div>
                    <button
                      onClick={loadData}
                      className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Làm mới
                    </button>
                  </div>

                  {/* List of upcoming matches for prediction */}
                  <div className="space-y-4">
                    {upcomingMatches.length === 0 ? (
                      <div className="py-16 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 font-medium text-xs">
                        Hiện tại không có trận đấu nào sắp diễn ra để dự đoán.
                      </div>
                    ) : (
                      upcomingMatches.map((match) => {
                        const existingPred = myPredictions.find(p => String(p.matchId) === String(match._id || match.id));
                        const tName = typeof match.tournamentId === "object" ? match.tournamentId?.name : "ASEAN Hyundai Cup";
                        
                        const matchTimeMs = new Date(match.matchTime || match.date).getTime();
                        const isUpcoming = matchTimeMs > Date.now();

                        return (
                          <div
                            key={match._id || match.id}
                            className="bg-slate-50/40 hover:bg-white border border-slate-100 hover:border-emerald-200 rounded-2xl p-5 transition-all duration-300 shadow-2xs hover:shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6"
                          >
                            {/* Tournament & Time & Live Countdown */}
                            <div className="w-full lg:w-[220px] flex-shrink-0 space-y-2">
                              <span className="inline-flex items-center gap-1 font-extrabold text-[9px] text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-100/50 uppercase tracking-wider">
                                <Trophy className="w-3 h-3 text-amber-500" />
                                {tName}
                              </span>
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                                <Calendar className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                                <span>{formatDate(match.matchTime || match.date)}</span>
                              </div>
                              
                              {/* Ant Design Live Ticking Countdown Clock */}
                              {isUpcoming ? (
                                <div className="bg-amber-50/60 border border-amber-100 rounded-xl px-3 py-1.5 w-max">
                                  <span className="text-[9px] text-amber-600 font-black uppercase tracking-wider flex items-center gap-1 mb-0.5 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    Còn lại để nhận định
                                  </span>
                                  <Statistic.Countdown 
                                    value={matchTimeMs} 
                                    format="D[ ngày] H:m:s" 
                                    valueStyle={{ fontSize: '11px', color: '#b45309', fontWeight: '950', fontFamily: 'monospace' }} 
                                  />
                                </div>
                              ) : (
                                <Badge status="processing" text={<span className="text-[10px] font-bold text-slate-400 uppercase">Sắp khởi tranh</span>} />
                              )}
                            </div>

                            {/* Versus Matchup */}
                            <div className="flex-1 flex items-center justify-center gap-4">
                              {/* Home Team */}
                              <div className="flex items-center gap-2.5 w-[110px] justify-end">
                                <span className="font-extrabold text-slate-800 text-sm truncate text-right w-full" title={getTeamName(match.homeTeam)}>
                                  {typeof match.homeTeam === "object" ? match.homeTeam?.shortName || match.homeTeam?.name : "Đội nhà"}
                                </span>
                                {getTeamLogo(match.homeTeam) ? (
                                  <img src={getTeamLogo(match.homeTeam)} alt="" className="w-8 h-8 rounded-full object-cover bg-slate-50 border border-slate-100 shadow-2xs" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">?</div>
                                )}
                              </div>

                              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center font-black text-slate-400 text-xs tracking-wider flex-shrink-0">
                                VS
                              </div>

                              {/* Away Team */}
                              <div className="flex items-center gap-2.5 w-[110px] justify-start">
                                {getTeamLogo(match.awayTeam) ? (
                                  <img src={getTeamLogo(match.awayTeam)} alt="" className="w-8 h-8 rounded-full object-cover bg-slate-50 border border-slate-100 shadow-2xs" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">?</div>
                                )}
                                <span className="font-extrabold text-slate-800 text-sm truncate text-left w-full" title={getTeamName(match.awayTeam)}>
                                  {typeof match.awayTeam === "object" ? match.awayTeam?.shortName || match.awayTeam?.name : "Đội khách"}
                                </span>
                              </div>
                            </div>

                            {/* User Prediction display / Action button */}
                            <div className="w-full lg:w-[220px] flex-shrink-0 flex items-center justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                              {existingPred ? (
                                <div className="flex items-center justify-between w-full lg:justify-end gap-3">
                                  <div className="text-right">
                                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Dự đoán của bạn</span>
                                    <span className="font-mono font-black text-emerald-600 text-sm">
                                      {existingPred.predictedHomeScore} - {existingPred.predictedAwayScore}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => openPredictionModal(match, existingPred)}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-emerald-700 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    Thay đổi
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => openPredictionModal(match, null)}
                                  className="w-full lg:w-auto bg-[#054432] hover:bg-[#033224] text-emerald-400 font-black px-4 py-2.5 rounded-xl text-xs tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  Dự đoán tỷ số
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LEADERBOARD */}
            {activeTab === "leaderboard" && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs max-w-2xl mx-auto">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                  <Award className="w-5.5 h-5.5 text-amber-500" />
                  Bảng xếp hạng dự đoán của toàn bộ thành viên
                </h3>

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
                            const isTop3 = idx < 3;
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
            )}

            {/* TAB 3: LEAGUES VIEW */}
            {activeTab === "leagues" && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <LeaguesView
                  loading={loading}
                  tournaments={data.tournaments}
                  matches={data.matches}
                  teams={data.teams}
                  stadiums={data.stadiums}
                  players={[]}
                  isAdmin={false}
                  onBack={() => setActiveTab("predict")}
                />
              </div>
            )}

            {/* TAB 4: PLAYER STATISTICS */}
            {activeTab === "stats" && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
                  <Trophy className="w-5.5 h-5.5 text-amber-500" />
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
                                    <div className="font-bold text-slate-800">{s.playerId?.name || "Cầu thủ"}</div>
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
                                    <div className="font-bold text-slate-800">{s.playerId?.name || "Cầu thủ"}</div>
                                    <div className="text-[10px] text-slate-400">{s.teamId?.name || "CLB"}</div>
                                    <Tooltip title={`${assists} đường kiến tạo`}>
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

                    {/* Card Stats */}
                    <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-5 hover:shadow-md transition-all duration-300">
                      <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 mb-4 uppercase tracking-wider border-b border-slate-100 pb-2">
                        <Shield className="w-4 h-4 text-amber-500" /> Thống kê thẻ phạt
                      </h4>
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="text-slate-400 font-bold uppercase border-b border-slate-100 pb-2">
                            <th className="py-2 w-8 text-center">#</th>
                            <th className="py-2">Cầu thủ</th>
                            <th className="py-2 text-center w-8">Vàng</th>
                            <th className="py-2 text-center w-8">Đỏ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {stats.cards.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="py-4 text-center text-slate-400">Chưa có số liệu.</td>
                            </tr>
                          ) : (
                            stats.cards.slice(0, 10).map((s, idx) => {
                              const yellows = s.yellowCards || 0;
                              const reds = s.redCards || 0;
                              const percent = maxYellowCards > 0 ? (yellows / maxYellowCards) * 100 : 0;
                              return (
                                <tr key={s._id} className="hover:bg-slate-100/50">
                                  <td className="py-2.5 text-center font-bold text-slate-550">{idx + 1}</td>
                                  <td className="py-2.5 pr-2">
                                    <div className="font-bold text-slate-800">{s.playerId?.name || "Cầu thủ"}</div>
                                    <div className="text-[10px] text-slate-400">{s.teamId?.name || "CLB"}</div>
                                    <Tooltip title={`${yellows} thẻ vàng, ${reds} thẻ đỏ`}>
                                      <Progress
                                        percent={percent}
                                        showInfo={false}
                                        strokeColor={{ '0%': '#eab308', '100%': '#ef4444' }}
                                        size="small"
                                        className="mt-1"
                                      />
                                    </Tooltip>
                                  </td>
                                  <td className="py-2.5 text-center font-black text-amber-500 font-mono text-sm">{yellows}</td>
                                  <td className="py-2.5 text-center font-black text-rose-600 font-mono text-sm">{reds}</td>
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
            )}
          </>
        )}
      </main>

      {/* Prediction Submission Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span className="font-black text-slate-800 text-sm tracking-tight">Dự đoán tỷ số trận đấu</span>
          </div>
        }
        open={isPredictionModalOpen}
        onOk={handlePredictionSubmit}
        confirmLoading={submittingPrediction}
        onCancel={() => {
          setIsPredictionModalOpen(false);
          setSelectedMatch(null);
        }}
        okText="Gửi dự đoán"
        cancelText="Hủy bỏ"
        centered
        width={420}
      >
        {selectedMatch && (
          <div className="my-5">
            <div className="flex items-center justify-between gap-4 py-4 bg-slate-50/60 px-4 border border-slate-150 rounded-2xl">
              {/* Home */}
              <div className="flex flex-col items-center gap-1.5 w-[110px] text-center">
                {getTeamLogo(selectedMatch.homeTeam) ? (
                  <img src={getTeamLogo(selectedMatch.homeTeam)} alt="" className="w-10 h-10 rounded-full object-cover bg-white border border-slate-100 shadow-2xs" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">?</div>
                )}
                <span className="font-extrabold text-slate-800 text-xs truncate w-full" title={getTeamName(selectedMatch.homeTeam)}>
                  {typeof selectedMatch.homeTeam === "object" ? selectedMatch.homeTeam?.shortName || selectedMatch.homeTeam?.name : "Đội nhà"}
                </span>
                <InputNumber
                  min={0}
                  max={20}
                  value={predictScores.home}
                  onChange={(val) => setPredictScores(prev => ({ ...prev, home: val || 0 }))}
                  size="large"
                  className="w-16 rounded-xl border-slate-250 font-mono font-bold text-center"
                />
              </div>

              <div className="font-black text-slate-400 text-sm font-mono">—</div>

              {/* Away */}
              <div className="flex flex-col items-center gap-1.5 w-[110px] text-center">
                {getTeamLogo(selectedMatch.awayTeam) ? (
                  <img src={getTeamLogo(selectedMatch.awayTeam)} alt="" className="w-10 h-10 rounded-full object-cover bg-white border border-slate-100 shadow-2xs" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">?</div>
                )}
                <span className="font-extrabold text-slate-800 text-xs truncate w-full" title={getTeamName(selectedMatch.awayTeam)}>
                  {typeof selectedMatch.awayTeam === "object" ? selectedMatch.awayTeam?.shortName || selectedMatch.awayTeam?.name : "Đội khách"}
                </span>
                <InputNumber
                  min={0}
                  max={20}
                  value={predictScores.away}
                  onChange={(val) => setPredictScores(prev => ({ ...prev, away: val || 0 }))}
                  size="large"
                  className="w-16 rounded-xl border-slate-250 font-mono font-bold text-center"
                />
              </div>
            </div>
            <div className="text-[10px] text-center text-slate-400 font-semibold mt-4">
              Thời gian đá: {formatDate(selectedMatch.matchTime || selectedMatch.date)}
            </div>
          </div>
        )}
      </Modal>

      {/* Footer */}
      <footer className="bg-[#05241b] text-slate-400 py-8 px-6 text-center border-t border-emerald-950 text-xs font-semibold flex-shrink-0">
        <p>© 2026 ASEAN Hyundai Cup Management. All rights reserved.</p>
        <p className="mt-1 text-slate-500">Được xây dựng trên nền tảng React, Node.js, Express và MongoDB.</p>
      </footer>
    </div>
  );
};

export default UserDashboardPage;
