import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { fetchDashboardOverview, fetchTopScorers, fetchTopAssists, fetchCardStatistics, fetchPredictionLeaderboard } from "../api";
import { Trophy, Tv, Users, LogIn, LogOut, RefreshCw, Calendar, Shield, Sparkles, User, Goal, TrendingUp } from "lucide-react";
import { LeaguesView } from "../components/admin";
import OngoingMatches from "../components/dashboard/OngoingMatches";
import { message, Spin, Carousel, Tabs, Progress, Badge, Statistic, Tooltip, Avatar, Select } from "antd";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("matches"); // matches, leagues, stats
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    matches: [],
    tournaments: [],
    teams: [],
    stadiums: []
  });

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);

  // Player statistics states
  const [loadingStats, setLoadingStats] = useState(false);
  const [stats, setStats] = useState({
    scorers: [],
    assists: [],
    cards: []
  });

  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Lỗi parse user:", e);
  }

  const loadData = async () => {
    try {
      setLoading(true);
      const overview = await fetchDashboardOverview();
      setData(overview);

      if (overview.tournaments && overview.tournaments.length > 0) {
        const firstTourId = overview.tournaments[0]._id || overview.tournaments[0].id;
        setSelectedTournamentId(firstTourId);
      }
    } catch (error) {
      message.error("Lỗi tải thông tin giải đấu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTournamentId) {
      const syncLeaderboardAndStats = async () => {
        try {
          const ranking = await fetchPredictionLeaderboard(selectedTournamentId);
          setLeaderboard(Array.isArray(ranking) ? ranking : []);
          await loadPlayerStats(selectedTournamentId);
        } catch (err) {
          console.error("Lỗi tải BXH hoặc thống kê giải đấu:", err);
        }
      };
      syncLeaderboardAndStats();
    }
  }, [selectedTournamentId]);

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
      console.error("Lỗi tải thống kê cầu thủ:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    message.success("Đăng xuất thành công!");
    navigate("/");
    window.location.reload();
  };

  // Helper functions for team mapping
  const getTeamName = (team) => {
    if (!team) return "—";
    return typeof team === "object" ? team.shortName || team.name : team;
  };

  const getTeamLogo = (team) => {
    if (team && typeof team === "object" && team.logo) return team.logo;
    return null;
  };

  // Dynamic match finder for the Hero Banner
  const liveMatch = (data.matches || []).find(m => m.status === "LIVE");
  const upcomingMatch = (data.matches || []).find(m => m.status === "NOT STARTED");
  const finishedMatch = (data.matches || []).find(m => m.status === "FINISHED");

  // Determine what hero match card to render
  let heroMatch = null;
  let heroMatchTitle = "Trận đấu sắp tới";
  let isLive = false;

  if (liveMatch) {
    heroMatch = liveMatch;
    heroMatchTitle = "Trận đấu đang diễn ra";
    isLive = true;
  } else if (upcomingMatch) {
    heroMatch = upcomingMatch;
    heroMatchTitle = "Trận đấu sắp tới";
  } else if (finishedMatch) {
    heroMatch = finishedMatch;
    heroMatchTitle = "Kết quả mới nhất";
  }

  // Calculate relative stats progress
  const maxGoals = stats.scorers.length > 0 ? Math.max(...stats.scorers.map(s => s.goals || 0)) : 10;
  const maxAssists = stats.assists.length > 0 ? Math.max(...stats.assists.map(a => a.assists || 0)) : 10;
  const maxYellowCards = stats.cards.length > 0 ? Math.max(...stats.cards.map(c => c.yellowCards || 0)) : 5;

  const activeTournament = data.tournaments && data.tournaments.length > 0
    ? data.tournaments.find(t => String(t._id || t.id) === String(selectedTournamentId)) || data.tournaments[0]
    : null;
  const tournamentName = activeTournament ? activeTournament.name : "Football Zone";

  return (
    <div className="min-h-screen bg-[#f3f7f5] text-slate-900 font-sans antialiased flex flex-col">
      {/* Premium Public Header */}
      <header className="bg-[#05241b] text-white border-b border-emerald-950 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl font-bold font-mono">
              ⚽
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none text-emerald-400 uppercase">FOOTBALL ZONE</h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 block">Hệ thống thông tin các giải đấu bóng đá trên hành tinh</span>
            </div>
          </div>

          {/* Login / Actions block */}
          <div className="flex items-center gap-3">
            {token && user ? (
              <>
                <button
                  onClick={() => navigate(user.role === "ADMIN" ? "/admin" : "/user")}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  {user.role === "ADMIN" ? "Quản trị viên" : "Trang cá nhân"} ({(user.userName || user.username || "User").split("@")[0]})
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white p-2.5 rounded-xl transition-colors cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-emerald-500 hover:bg-emerald-400 text-[#05241b] font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập / Đăng ký
              </button>
            )}
          </div>
        </div>
      </header>

      {/* FIFA-style News & Match Carousel (FULLY DATABASE-DRIVEN) */}
      {activeTab === "matches" && (
        <section className="bg-[#05241b] text-white relative overflow-hidden flex-shrink-0">
          <Carousel autoplay autoplaySpeed={6000} effect="fade" speed={800} className="w-full">
            {/* Dynamic slides for each tournament in the database */}
            {data.tournaments.map((tournament) => {
              const tourMatches = (data.matches || []).filter(m => {
                const mTourId = typeof m.tournamentId === "object" ? m.tournamentId?._id : m.tournamentId;
                return String(mTourId) === String(tournament._id || tournament.id);
              });
              
              const tourLiveMatch = tourMatches.find(m => m.status === "LIVE");
              const tourUpcomingMatch = tourMatches.find(m => m.status === "NOT STARTED");
              const tourFinishedMatch = tourMatches.find(m => m.status === "FINISHED");
              
              let tourHeroMatch = null;
              let tourHeroMatchTitle = "Trận đấu sắp tới";
              let tourIsLive = false;
              
              if (tourLiveMatch) {
                tourHeroMatch = tourLiveMatch;
                tourHeroMatchTitle = "Trận đấu đang diễn ra";
                tourIsLive = true;
              } else if (tourUpcomingMatch) {
                tourHeroMatch = tourUpcomingMatch;
                tourHeroMatchTitle = "Trận đấu sắp tới";
              } else if (tourFinishedMatch) {
                tourHeroMatch = tourFinishedMatch;
                tourHeroMatchTitle = "Kết quả mới nhất";
              }
              
              return (
                <div key={tournament._id || tournament.id} className="relative py-14 px-6">
                  <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[150%] bg-emerald-500/5 rounded-full blur-[120px]" />
                  <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider rounded-full">
                        <Trophy className="w-3.5 h-3.5" />
                        Giải đấu đang diễn ra
                      </span>
                      <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-none text-white">
                        {tournament.name}
                      </h2>
                      <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
                        Mùa giải {tournament.season || "2026"} • Thể thức {tournament.type === "CUP" ? "Cúp loại trực tiếp" : "Vòng tròn tính điểm"}. Cập nhật lịch thi đấu trực tuyến, sơ đồ thi đấu, sự kiện trực tiếp (bàn thắng, thẻ phạt, thay người) nhanh nhất.
                      </p>
                      {!token && (
                        <div className="pt-2">
                          <button
                            onClick={() => navigate("/login")}
                            className="bg-emerald-500 hover:bg-emerald-400 text-[#05241b] font-black text-xs px-5 py-3 rounded-xl transition-all shadow-lg hover:scale-105 duration-200 cursor-pointer"
                          >
                            Đăng nhập để nhận định & dự đoán tỷ số 🌟
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Hero Match Visualizer */}
                    <div className="hidden lg:flex justify-end">
                      {tourHeroMatch ? (
                        <div className="w-[380px] h-[200px] bg-[#0c3126] border border-emerald-800/40 rounded-3xl p-6 shadow-2xl flex flex-col justify-between hover:scale-105 transition-transform duration-300">
                          <div className="flex justify-between items-center text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest">
                            <span>{tourHeroMatchTitle}</span>
                            {tourIsLive ? (
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                                <span className="text-rose-500 text-[10px]">TRỰC TIẾP</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                {(typeof tourHeroMatch.roundName === "object" ? tourHeroMatch.roundName?.roundName : tourHeroMatch.roundName) || (tourHeroMatch.round ? `Vòng ${tourHeroMatch.round}` : "")}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center py-4">
                            <div className="text-center w-24">
                              {getTeamLogo(tourHeroMatch.homeTeam) ? (
                                <img src={getTeamLogo(tourHeroMatch.homeTeam)} alt="" className="w-10 h-10 rounded-full object-cover mx-auto mb-2 bg-slate-900/30 p-0.5 border border-emerald-800/30" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-[#05241b] border border-emerald-950 flex items-center justify-center mx-auto mb-2 text-sm font-bold">?</div>
                              )}
                              <span className="font-extrabold text-xs block truncate" title={getTeamName(tourHeroMatch.homeTeam)}>{getTeamName(tourHeroMatch.homeTeam)}</span>
                            </div>
                            <div className="text-center">
                              <span className="text-2xl font-black font-mono tracking-widest text-emerald-400">
                                {tourHeroMatch.status === "NOT STARTED" ? "VS" : `${tourHeroMatch.homeScore} - ${tourHeroMatch.awayScore}`}
                              </span>
                              <span className="block text-[9px] text-slate-400 font-bold mt-1 uppercase">
                                {tourHeroMatch.status === "LIVE" ? "Hiệp đấu" : tourHeroMatch.status === "FINISHED" ? "Đã xong" : "Chưa đá"}
                              </span>
                            </div>
                            <div className="text-center w-24">
                              {getTeamLogo(tourHeroMatch.awayTeam) ? (
                                <img src={getTeamLogo(tourHeroMatch.awayTeam)} alt="" className="w-10 h-10 rounded-full object-cover mx-auto mb-2 bg-slate-900/30 p-0.5 border border-emerald-800/30" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-[#05241b] border border-emerald-950 flex items-center justify-center mx-auto mb-2 text-sm font-bold">?</div>
                              )}
                              <span className="font-extrabold text-xs block truncate" title={getTeamName(tourHeroMatch.awayTeam)}>{getTeamName(tourHeroMatch.awayTeam)}</span>
                            </div>
                          </div>
                          <div className="text-[9px] text-slate-400 text-center font-medium truncate">
                            Sân: {tourHeroMatch.stadium?.name || "Chưa chọn sân"}
                          </div>
                        </div>
                      ) : (
                        <div className="w-[380px] h-[200px] bg-[#0c3126] border border-emerald-800/40 rounded-3xl p-6 shadow-2xl flex flex-col justify-center items-center text-center">
                          <Shield className="w-8 h-8 text-emerald-500 mb-2" />
                          <span className="text-xs text-slate-300 font-bold">Chưa xếp trận đấu nào cho giải đấu này</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Slide 2: Predictions Intro & Real Predictions Leaderboard */}
            <div className="relative py-14 px-6 bg-gradient-to-r from-teal-950 to-emerald-900">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-black uppercase tracking-wider rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />
                    Thử Tài Dự Đoán Tỷ Số
                  </span>
                  <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-none text-white">
                    Đại Chiến Dự Đoán Tỷ Số
                  </h2>
                  <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
                    Dự đoán kết quả, tích lũy điểm số, vươn lên ngôi vị dẫn đầu trên Bảng xếp hạng dự đoán của chúng tôi. Phần quà hấp dẫn đang chờ đón chuyên gia phân tích xuất sắc nhất!
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => navigate(token ? "/user" : "/login")}
                      className="bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs px-5 py-3 rounded-xl transition-all shadow-lg hover:scale-105 duration-200 cursor-pointer"
                    >
                      {token ? "Dự đoán ngay" : "Tạo tài khoản tham gia"} 🚀
                    </button>
                  </div>
                </div>

                {/* Real Leaderboard Top 3 - Loading from MongoDB */}
                <div className="hidden lg:flex justify-end">
                  <div className="w-[380px] bg-[#07241d]/85 border border-teal-800/40 rounded-3xl p-5 shadow-2xl">
                    <h3 className="text-[10px] font-extrabold text-teal-400 uppercase tracking-widest border-b border-teal-950 pb-2 mb-3">BXH Chuyên Gia Dự Đoán (Real DB)</h3>
                    <div className="space-y-3">
                      {leaderboard.length === 0 ? (
                        <div className="text-xs text-slate-400 py-6 text-center font-medium">Chưa có điểm dự đoán được tính.</div>
                      ) : (
                        leaderboard.slice(0, 3).map((row, idx) => {
                          const uName = (row.userId?.userName || row.accountId?.userName || "Thành viên").split("@")[0];
                          const score = row.totalPoints || row.totalScore || 0;
                          return (
                            <div key={row._id || idx} className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                                <Avatar size="small" style={{
                                  backgroundColor: idx === 0 ? '#f59e0b' : idx === 1 ? '#cbd5e1' : '#b45309',
                                  color: idx === 1 ? '#1e293b' : '#ffffff',
                                  fontSize: '10px',
                                  fontWeight: 'bold'
                                }}>
                                  {idx + 1}
                                </Avatar>
                                {uName}
                              </span>
                              <Badge count={`${score}đ`} showZero color="#10b981" />
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Carousel>
        </section>
      )}

      {/* Main Navigation Tabs */}
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
                key: "matches",
                label: (
                  <span className="flex items-center gap-2 font-black text-xs uppercase tracking-wider py-1">
                    <Calendar className="w-4 h-4" /> Lịch thi đấu
                  </span>
                )
              },
              {
                key: "leagues",
                label: (
                  <span className="flex items-center gap-2 font-black text-xs uppercase tracking-wider py-1">
                    <Trophy className="w-4 h-4" /> Giải đấu & Nhánh đấu
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center gap-3">
            <Spin size="large" />
            <span className="text-slate-400 font-semibold text-xs animate-pulse">Đang đồng bộ dữ liệu giải đấu từ MongoDB...</span>
          </div>
        ) : (
          <>
            {/* TAB 1: MATCHES LIST (Lịch thi đấu) */}
            {activeTab === "matches" && (
              <div className="space-y-8">
                {data.tournaments.map(tournament => {
                  const tourMatches = (data.matches || []).filter(m => {
                    const mTourId = typeof m.tournamentId === "object" ? m.tournamentId?._id : m.tournamentId;
                    return String(mTourId) === String(tournament._id || tournament.id);
                  });
                  if (tourMatches.length === 0) return null;
                  
                  return (
                    <div key={tournament._id || tournament.id} className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
                      <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Trophy className="w-4.5 h-4.5 text-emerald-600 animate-pulse" /> {tournament.name}
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        <OngoingMatches
                          title="Trận đấu đang và sắp diễn ra"
                          matches={tourMatches.filter((m) => m.status !== "FINISHED")}
                          loading={loading}
                          showControlBtn={false}
                        />
                        <OngoingMatches
                          title="Trận đấu đã kết thúc"
                          matches={tourMatches.filter((m) => m.status === "FINISHED")}
                          loading={loading}
                          showControlBtn={false}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: LEAGUES VIEW (Giải đấu & Bảng xếp hạng) */}
            {activeTab === "leagues" && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <LeaguesView
                  loading={loading}
                  tournaments={data.tournaments}
                  matches={data.matches}
                  teams={data.teams}
                  stadiums={data.stadiums}
                  players={[]}
                  isAdmin={false}
                  onBack={() => setActiveTab("matches")}
                />
              </div>
            )}

            {/* TAB 3: PLAYER STATISTICS (Thống kê cầu thủ) */}
            {activeTab === "stats" && (
              <div className="space-y-8">
                <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-2xs">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 mb-6 gap-3">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <Trophy className="w-5.5 h-5.5 text-amber-500" />
                      Thống kê thành tích cá nhân xuất sắc nhất
                    </h3>
                    <div className="flex items-center gap-3">
                      {data.tournaments && data.tournaments.length > 0 && (
                        <Select
                          value={selectedTournamentId || (data.tournaments[0]._id || data.tournaments[0].id)}
                          onChange={(val) => setSelectedTournamentId(val)}
                          style={{ width: 220 }}
                          className="font-bold text-slate-800"
                          options={data.tournaments.map(t => ({
                            label: t.name,
                            value: t._id || t.id
                          }))}
                        />
                      )}
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Cập nhật trực tiếp
                      </span>
                    </div>
                  </div>

                  {loadingStats ? (
                    <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                      <Spin size="default" />
                      <span className="text-xs">Đang tải bảng số liệu...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                      {/* Top Scorers */}
                      <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-5 hover:shadow-md transition-shadow duration-300">
                        <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 mb-4 uppercase tracking-wider border-b border-slate-100 pb-2">
                          <Goal className="w-4 h-4 text-emerald-600" /> Vua phá lưới
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead>
                              <tr className="text-slate-400 font-bold uppercase border-b border-slate-100 pb-2">
                                <th className="py-2 w-8 text-center">#</th>
                                <th className="py-2">Cầu thủ</th>
                                <th className="py-2 text-center w-16">Bàn thắng</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                              {stats.scorers.length === 0 ? (
                                <tr>
                                  <td colSpan="3" className="py-4 text-center text-slate-400 font-medium">Chưa có số liệu.</td>
                                </tr>
                              ) : (
                                stats.scorers.slice(0, 10).map((s, idx) => {
                                  const goals = s.goals || 0;
                                  const percent = maxGoals > 0 ? (goals / maxGoals) * 100 : 0;
                                  return (
                                    <tr key={s._id} className="hover:bg-slate-100/50 transition-colors">
                                      <td className="py-3.5 text-center">
                                        <span className={`inline-flex items-center justify-center w-5.5 h-5.5 rounded-full text-[10px] font-black ${idx === 0 ? "bg-amber-400 text-amber-950" : "text-slate-450"
                                          }`}>
                                          {idx + 1}
                                        </span>
                                      </td>
                                      <td className="py-3.5 pr-2">
                                        <div className="font-bold text-slate-800">{s.playerId?.name || "Cầu thủ"}</div>
                                        <div className="text-[10px] text-slate-400">{s.teamId?.name || "CLB"}</div>
                                        <Tooltip title={`${goals} bàn thắng`}>
                                          <Progress
                                            percent={percent}
                                            showInfo={false}
                                            strokeColor={{ '0%': '#10b981', '100%': '#059669' }}
                                            size="small"
                                            className="mt-1.5"
                                          />
                                        </Tooltip>
                                      </td>
                                      <td className="py-3.5 text-center font-black text-emerald-600 font-mono text-sm">{goals}</td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Top Assists */}
                      <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-5 hover:shadow-md transition-shadow duration-300">
                        <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 mb-4 uppercase tracking-wider border-b border-slate-100 pb-2">
                          <Users className="w-4 h-4 text-blue-600" /> Kiến tạo hàng đầu
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead>
                              <tr className="text-slate-400 font-bold uppercase border-b border-slate-100 pb-2">
                                <th className="py-2 w-8 text-center">#</th>
                                <th className="py-2">Cầu thủ</th>
                                <th className="py-2 text-center w-16">Kiến tạo</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                              {stats.assists.length === 0 ? (
                                <tr>
                                  <td colSpan="3" className="py-4 text-center text-slate-400 font-medium">Chưa có số liệu.</td>
                                </tr>
                              ) : (
                                stats.assists.slice(0, 10).map((s, idx) => {
                                  const assists = s.assists || 0;
                                  const percent = maxAssists > 0 ? (assists / maxAssists) * 100 : 0;
                                  return (
                                    <tr key={s._id} className="hover:bg-slate-100/50 transition-colors">
                                      <td className="py-3.5 text-center">
                                        <span className={`inline-flex items-center justify-center w-5.5 h-5.5 rounded-full text-[10px] font-black ${idx === 0 ? "bg-blue-400 text-white" : "text-slate-450"
                                          }`}>
                                          {idx + 1}
                                        </span>
                                      </td>
                                      <td className="py-3.5 pr-2">
                                        <div className="font-bold text-slate-800">{s.playerId?.name || "Cầu thủ"}</div>
                                        <div className="text-[10px] text-slate-400">{s.teamId?.name || "CLB"}</div>
                                        <Tooltip title={`${assists} đường kiến tạo`}>
                                          <Progress
                                            percent={percent}
                                            showInfo={false}
                                            strokeColor={{ '0%': '#3b82f6', '100%': '#2563eb' }}
                                            size="small"
                                            className="mt-1.5"
                                          />
                                        </Tooltip>
                                      </td>
                                      <td className="py-3.5 text-center font-black text-blue-600 font-mono text-sm">{assists}</td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Card Statistics */}
                      <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-5 hover:shadow-md transition-shadow duration-300">
                        <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 mb-4 uppercase tracking-wider border-b border-slate-100 pb-2">
                          <Shield className="w-4 h-4 text-amber-500" /> Thống kê thẻ phạt
                        </h4>
                        <div className="overflow-x-auto">
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
                                  <td colSpan="4" className="py-4 text-center text-slate-400 font-medium">Chưa có số liệu.</td>
                                </tr>
                              ) : (
                                stats.cards.slice(0, 10).map((s, idx) => {
                                  const yellows = s.yellowCards || 0;
                                  const reds = s.redCards || 0;
                                  const percent = maxYellowCards > 0 ? (yellows / maxYellowCards) * 100 : 0;
                                  return (
                                    <tr key={s._id} className="hover:bg-slate-100/50 transition-colors">
                                      <td className="py-3.5 text-center">
                                        <span className={`inline-flex items-center justify-center w-5.5 h-5.5 rounded-full text-[10px] font-black text-slate-400`}>
                                          {idx + 1}
                                        </span>
                                      </td>
                                      <td className="py-3.5 pr-2">
                                        <div className="font-bold text-slate-800">{s.playerId?.name || "Cầu thủ"}</div>
                                        <div className="text-[10px] text-slate-400">{s.teamId?.name || "CLB"}</div>
                                        <Tooltip title={`${yellows} thẻ vàng, ${reds} thẻ đỏ`}>
                                          <Progress
                                            percent={percent}
                                            showInfo={false}
                                            strokeColor={{ '0%': '#eab308', '100%': '#ef4444' }}
                                            size="small"
                                            className="mt-1.5"
                                          />
                                        </Tooltip>
                                      </td>
                                      <td className="py-3.5 text-center font-black text-amber-500 font-mono text-sm">{yellows}</td>
                                      <td className="py-3.5 text-center font-black text-rose-600 font-mono text-sm">{reds}</td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#05241b] text-slate-400 py-8 px-6 text-center border-t border-emerald-950 text-xs font-semibold flex-shrink-0">
        <p>© 2026 {tournamentName} Management. All rights reserved.</p>
        <p className="mt-1 text-slate-500">Được xây dựng trên nền tảng React, Node.js, Express và MongoDB.</p>
      </footer>
    </div>
  );
};

export default HomePage;
