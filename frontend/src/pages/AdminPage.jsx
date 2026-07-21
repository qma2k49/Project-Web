import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import StatCard from "../components/StatCard";
import OngoingMatches from "../components/OngoingMatches";
import RecentActivity from "../components/RecentActivity";
import CreateMatchModal from "../components/CreateMatchModal";
import LiveControlDrawer from "../components/LiveControlDrawer";
import ExportStatsModal from "../components/ExportStatsModal";
import { fetchDashboardOverview } from "../api";
import { Download, Plus, Trophy, Tv, Users, Cloud, RefreshCw } from "lucide-react";
import { Modal, message } from "antd";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    matches: [],
    tournaments: [],
    teams: [],
    stadiums: [],
  });

  // Ant Design Popup Modals & Drawers visibility state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLiveControlOpen, setIsLiveControlOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const loadDataFromDB = async () => {
    setLoading(true);
    const dbData = await fetchDashboardOverview();
    setData(dbData);
    setLoading(false);
  };

  useEffect(() => {
    loadDataFromDB();
  }, []);

  const handleOpenLiveControl = (match) => {
    setSelectedMatch(match);
    setIsLiveControlOpen(true);
  };

  const handleClearHistoryConfirm = () => {
    Modal.confirm({
      title: "Xác nhận xóa nhật ký",
      content: "Bạn có chắc chắn muốn xóa tất cả lịch sử hoạt động gần đây không?",
      okText: "Xóa lịch sử",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        message.success("Đã xóa sạch lịch sử hoạt động hệ thống!");
      },
    });
  };

  // Compute live statistics from MongoDB data
  const totalLeaguesCount = data.tournaments.length;
  const matchesCount = data.matches.length;
  const totalTeamsCount = data.teams.length;
  const stadiumsCount = data.stadiums.length;

  return (
    <div className="flex min-h-screen bg-[#f8faf9] text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <AdminHeader title="Bảng quản trị (Ant Design Popup Modals)" />

        {/* Main Content Area */}
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* System Overview Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                Tổng quan hệ thống
                {loading && <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />}
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Dữ liệu trực tiếp kết nối với MongoDB Atlas Server (port 3000).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadDataFromDB}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-gray-200 text-xs shadow-xs transition-colors"
              >
                <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
                Làm mới CSDL
              </button>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-gray-200 text-xs shadow-xs transition-colors"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Xuất thống kê
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 bg-[#0d1726] hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Trận đấu mới
              </button>
            </div>
          </div>

          {/* 4 Stats Cards Grid with Real Database Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Tổng số giải đấu"
              value={totalLeaguesCount}
              badgeText={`${totalLeaguesCount} Giải đấu`}
              badgeType="emerald"
              icon={Trophy}
              iconBg="bg-slate-900 text-white"
            />
            <StatCard
              title="Tổng số trận đấu"
              value={matchesCount}
              badgeText={matchesCount > 0 ? "LIVE DB" : "TRỐNG"}
              badgeType={matchesCount > 0 ? "red" : "neutral"}
              icon={Tv}
              iconBg="bg-emerald-400 text-slate-950"
            />
            <StatCard
              title="Tổng số đội bóng"
              value={totalTeamsCount}
              badgeText={`${totalTeamsCount} CLB`}
              badgeType="neutral"
              icon={Users}
              iconBg="bg-slate-100 text-slate-700"
            />
            <StatCard
              title="Sân vận động"
              value={stadiumsCount}
              badgeText={`${stadiumsCount} Sân`}
              progressLine="100%"
              icon={Cloud}
              iconBg="bg-slate-100 text-slate-700"
            />
          </div>

          {/* 2-Column Main Section: Ongoing Matches & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Primary Column: Ongoing Matches */}
            <div className="lg:col-span-7 xl:col-span-8">
              <OngoingMatches
                matches={data.matches}
                loading={loading}
                onLiveControl={handleOpenLiveControl}
              />
            </div>

            {/* Right Secondary Column: Recent Activity */}
            <div className="lg:col-span-5 xl:col-span-4">
              <RecentActivity onClearHistory={handleClearHistoryConfirm} />
            </div>
          </div>
        </main>
      </div>

      {/* Ant Design Popups & Drawers */}
      <CreateMatchModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadDataFromDB}
        tournaments={data.tournaments}
        teams={data.teams}
        stadiums={data.stadiums}
      />

      <LiveControlDrawer
        visible={isLiveControlOpen}
        onClose={() => setIsLiveControlOpen(false)}
        match={selectedMatch}
        onEventTriggered={loadDataFromDB}
      />

      <ExportStatsModal
        visible={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};

export default AdminPage;
