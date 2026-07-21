import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import StatCard from "../components/StatCard";
import OngoingMatches from "../components/OngoingMatches";
import RecentActivity from "../components/RecentActivity";
import CreateMatchModal from "../components/CreateMatchModal";
import LiveControlDrawer from "../components/LiveControlDrawer";
import ExportStatsModal from "../components/ExportStatsModal";
import { fetchDashboardOverview, fetchPersons, updateTeam } from "../api";
import { Download, Plus, Trophy, Tv, Users, Cloud, RefreshCw, Search, Pencil } from "lucide-react";
import { Modal, message, Input, Form, Select } from "antd";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState({
    matches: [],
    tournaments: [],
    teams: [],
    stadiums: [],
    coaches: [],
  });

  // Ant Design Popup Modals & Drawers visibility state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLiveControlOpen, setIsLiveControlOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [editTeamForm, setEditTeamForm] = useState({
    name: "",
    shortName: "",
    city: "",
    country: "",
    homeStadium: "",
    coach: null,
    coachName: "",
  });

  const loadDataFromDB = async () => {
    setLoading(true);
    const [dbData, coachesData] = await Promise.all([
      fetchDashboardOverview(),
      fetchPersons("Coach"),
    ]);

    const nextData = {
      ...dbData,
      coaches: Array.isArray(coachesData) ? coachesData : [],
    };

    setData(nextData);
    setLoading(false);
    return nextData;
  };

  useEffect(() => {
    loadDataFromDB();
  }, []);

  const handleOpenLiveControl = (match) => {
    setSelectedMatch(match);
    setIsLiveControlOpen(true);
  };

  const openEditTeamModal = async (team) => {
    const latestData = await loadDataFromDB();
    const coaches = latestData.coaches || [];
    const selectedCoachId = typeof team?.coach === "object"
      ? team.coach?._id
      : team?.coach || team?.coachId || coaches.find((coach) => coach.name === team?.coachName || coach._id === team?.coach)?._id || null;

    setEditingTeam(team);
    setEditTeamForm({
      name: team?.name || "",
      shortName: team?.shortName || "",
      city: team?.city || "",
      country: team?.country || "",
      homeStadium: team?.homeStadium || team?.stadium?.name || "",
      coach: selectedCoachId,
      coachName: team?.coachName || "",
    });
    setIsEditTeamModalOpen(true);
  };

  const handleEditTeamSubmit = async () => {
    if (!editingTeam) return;

    try {
      const response = await updateTeam(editingTeam._id, editTeamForm);
      message.success("Cập nhật thông tin đội bóng thành công!");
      setData((prev) => ({
        ...prev,
        teams: prev.teams.map((team) => (team._id === editingTeam._id ? { ...team, ...response.team } : team)),
      }));
      setIsEditTeamModalOpen(false);
      setEditingTeam(null);
    } catch (error) {
      message.error(error?.response?.data?.message || "Không thể cập nhật đội bóng");
    }
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
  const isLeaguesView = activeTab === "leagues";
  const isTeamsView = activeTab === "teams";

  const filteredTeams = (data.teams || []).filter((team) => {
    const keyword = searchTerm.toLowerCase();
    return !keyword || [team.name, team.shortName, team.city, team.homeStadium, team.coachName]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword));
  });

  const selectedTeam = filteredTeams[0] || null;

  if (isLeaguesView) {
    return (
      <div className="flex min-h-screen bg-[#f8faf9] text-slate-900 font-sans antialiased">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader title="Quản lý giải đấu" />

          <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  Danh sách giải đấu
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Quản lý các giải đấu đang hoạt động và theo dõi thông tin ngắn gọn của từng giải.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-gray-200 text-xs shadow-xs transition-colors"
              >
                Quay lại tổng quan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {loading ? (
                <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-gray-200 bg-white p-10 text-center text-slate-500">
                  Đang tải dữ liệu giải đấu...
                </div>
              ) : data.tournaments.length === 0 ? (
                <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-gray-200 bg-white p-10 text-center text-slate-500">
                  Chưa có giải đấu nào trong cơ sở dữ liệu.
                </div>
              ) : (
                data.tournaments.map((tournament) => (
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
                      <p>• Tổng trận đấu: {data.matches.filter((match) => {
                        const tournamentId = typeof match.tournamentId === "object" ? match.tournamentId?._id : match.tournamentId;
                        return tournamentId === tournament._id;
                      }).length}</p>
                      <p>• Số đội tham gia: {data.teams.length}</p>
                      <p>• Sân vận động hỗ trợ: {data.stadiums.length}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isTeamsView) {
    return (
      <div className="flex min-h-screen bg-[#f8faf9] text-slate-900 font-sans antialiased">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader title="Quản lý đội bóng" />

          <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  Tìm kiếm thông tin đội bóng
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Nhập tên đội, tên viết tắt, thành phố hoặc sân nhà để tra cứu thông tin nhanh.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-gray-200 text-xs shadow-xs transition-colors"
              >
                Quay lại tổng quan
              </button>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <label className="text-sm font-semibold text-slate-700">Tìm đội bóng</label>
              <Input
                size="large"
                prefix={<Search className="w-4 h-4 text-slate-400" />}
                placeholder="Nhập tên đội bóng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-2"
              />
            </div>

            {loading ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-slate-500">
                Đang tải dữ liệu đội bóng...
              </div>
            ) : !searchTerm ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-slate-500">
                Hãy nhập từ khóa để tra cứu thông tin đội bóng.
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-slate-500">
                Không tìm thấy đội bóng phù hợp.
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl font-black text-emerald-700 uppercase">
                      {selectedTeam?.shortName || selectedTeam?.name?.slice(0, 2) || "CL"}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedTeam?.name}</h2>
                      <p className="text-sm text-slate-500">{selectedTeam?.shortName || "Tên viết tắt"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openEditTeamModal(selectedTeam)}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    <Pencil className="w-4 h-4" />
                    Chỉnh sửa
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Thành phố</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedTeam?.city || "Chưa cập nhật"}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sân nhà</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedTeam?.homeStadium || "Chưa cập nhật"}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">HLV</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedTeam?.coachName || "Chưa cập nhật"}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Số trận đấu</p>
                    <p className="mt-1 font-semibold text-slate-900">{data.matches.filter((match) => {
                      const homeId = typeof match.homeTeam === "object" ? match.homeTeam?._id : match.homeTeam;
                      const awayId = typeof match.awayTeam === "object" ? match.awayTeam?._id : match.awayTeam;
                      return homeId === selectedTeam?._id || awayId === selectedTeam?._id;
                    }).length}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trạng thái</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedTeam?.status || "Đang hoạt động"}</p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        <Modal
          title="Chỉnh sửa thông tin đội bóng"
          open={isEditTeamModalOpen}
          onCancel={() => setIsEditTeamModalOpen(false)}
          onOk={handleEditTeamSubmit}
          okText="Lưu thay đổi"
          cancelText="Hủy"
        >
          <Form layout="vertical" className="mt-3">
            <Form.Item label="Tên đội">
              <Input
                value={editTeamForm.name}
                onChange={(e) => setEditTeamForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nhập tên đội bóng"
              />
            </Form.Item>
            <Form.Item label="Tên viết tắt">
              <Input
                value={editTeamForm.shortName}
                onChange={(e) => setEditTeamForm((prev) => ({ ...prev, shortName: e.target.value }))}
                placeholder="Ví dụ: HNFC"
              />
            </Form.Item>
            <Form.Item label="Thành phố">
              <Input
                value={editTeamForm.city}
                onChange={(e) => setEditTeamForm((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Ví dụ: Hà Nội"
              />
            </Form.Item>
            <Form.Item label="Quốc gia">
              <Input
                value={editTeamForm.country}
                onChange={(e) => setEditTeamForm((prev) => ({ ...prev, country: e.target.value }))}
                placeholder="Ví dụ: Việt Nam"
              />
            </Form.Item>
            <Form.Item label="Sân nhà">
              <Select
                showSearch
                allowClear
                placeholder="Chọn sân nhà"
                value={editTeamForm.homeStadium || undefined}
                onChange={(value) => setEditTeamForm((prev) => ({ ...prev, homeStadium: value || "" }))}
                options={(data.stadiums || []).map((stadium) => ({
                  label: stadium.name,
                  value: stadium.name,
                }))}
                filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
              />
            </Form.Item>
            <Form.Item label="HLV">
              <Select
                showSearch
                allowClear
                placeholder="Chọn HLV"
                value={editTeamForm.coach || undefined}
                onChange={(value) => {
                  const selectedCoach = (data.coaches || []).find((coach) => coach._id === value);
                  setEditTeamForm((prev) => ({
                    ...prev,
                    coach: value || null,
                    coachName: selectedCoach?.name || "",
                  }));
                }}
                options={(data.coaches || []).map((coach) => ({
                  label: coach.name,
                  value: coach._id,
                }))}
                filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
  );
}

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
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadDataFromDB}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-gray-200 text-xs shadow-xs transition-colors"
              >
                <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
                Làm mới
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

    </div>
  );
};

export default AdminPage;
