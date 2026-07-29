import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  fetchDashboardOverview,
  fetchMyPredictions,
  fetchPredictionLeaderboard,
  fetchTopScorers,
  fetchTopAssists,
  fetchCardStatistics,
  fetchPersons
} from "../api";
import { Trophy, Users, LogOut, Award, Sparkles } from "lucide-react";
import { LeaguesView } from "../components/admin";
import { message, Spin, Tabs } from "antd";
import UserPredictView from "../components/dashboard/UserPredictView";
import UserLeaderboardView from "../components/dashboard/UserLeaderboardView";
import UserStatsView from "../components/dashboard/UserStatsView";

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

  const [allPlayers, setAllPlayers] = useState([]);
  const [leaderboardTournamentId, setLeaderboardTournamentId] = useState(null);

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

      // Load all players for prediction scorer choices
      try {
        const playersList = await fetchPersons("Player");
        setAllPlayers(Array.isArray(playersList) ? playersList : []);
      } catch (err) {
        console.error("Lỗi tải danh sách cầu thủ:", err);
      }

      // Load statistics for first tournament
      if (overview.tournaments && overview.tournaments.length > 0) {
        const defaultTournamentId = overview.tournaments[0]._id || overview.tournaments[0].id;
        setLeaderboardTournamentId(defaultTournamentId);
        await loadPlayerStats(defaultTournamentId);
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

  const loadLeaderboardData = async (tId = leaderboardTournamentId) => {
    try {
      setLoadingLeaderboard(true);
      const ranking = await fetchPredictionLeaderboard(tId);
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
    if (activeTab === "leaderboard" && leaderboardTournamentId) {
      loadLeaderboardData(leaderboardTournamentId);
    }
  }, [activeTab, leaderboardTournamentId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    message.success("Đăng xuất thành công!");
    navigate("/");
  };

  if (!currentUser) return null;

  // Load all matches for prediction feed so users can compare scores
  const predictionMatches = data.matches || [];

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
            <div className="w-10 h-10 rounded-xl bg-emerald-505/10 border border-emerald-500/20 flex items-center justify-center text-xl font-bold font-mono">
              ⚽
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none text-emerald-400">FOOTBALL ZONE</h1>
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
              <UserPredictView
                tournaments={data.tournaments}
                predictionMatches={predictionMatches}
                myPredictions={myPredictions}
                allPlayers={allPlayers}
                token={token}
                setMyPredictions={setMyPredictions}
                loadData={loadData}
              />
            )}

            {/* TAB 2: LEADERBOARD */}
            {activeTab === "leaderboard" && (
              <UserLeaderboardView
                tournaments={data.tournaments}
                leaderboard={leaderboard}
                leaderboardTournamentId={leaderboardTournamentId}
                setLeaderboardTournamentId={setLeaderboardTournamentId}
                loadingLeaderboard={loadingLeaderboard}
              />
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
              <UserStatsView
                loadingStats={loadingStats}
                stats={stats}
                maxGoals={maxGoals}
                maxAssists={maxAssists}
                maxYellowCards={maxYellowCards}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#05241b] text-slate-400 py-8 px-6 text-center border-t border-emerald-950 text-xs font-semibold flex-shrink-0">
        <p>© 2026 Football Zone. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default UserDashboardPage;
