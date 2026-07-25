import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/layout/AdminSidebar";
import AdminHeader from "../components/layout/AdminHeader";
import StatCard from "../components/dashboard/StatCard";
import OngoingMatches from "../components/dashboard/OngoingMatches";
import RecentActivity from "../components/dashboard/RecentActivity";
import CreateMatchModal from "../components/admin/modals/CreateMatchModal";
import LiveControlDrawer from "../components/admin/modals/LiveControlDrawer";
import ExportStatsModal from "../components/admin/modals/ExportStatsModal";
import { fetchDashboardOverview, fetchPersons, updateTeam, createStadium, updateStadium, createPerson, updatePerson } from "../api";
import { Download, Plus, Trophy, Tv, Users, Cloud, RefreshCw, Search, Pencil, Upload } from "lucide-react";
import { Modal, message, Input } from "antd";
import { LeaguesView, TeamsView, StadiumsView, PersonnelView, LiveControlView, PageHeader } from "../components/admin";
import TeamEditModal from "../components/admin/modals/TeamEditModal";
import StadiumModal from "../components/admin/modals/StadiumModal";
import PersonModal from "../components/admin/modals/PersonModal";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stadiumSearchTerm, setStadiumSearchTerm] = useState("");
  const [data, setData] = useState({
    matches: [],
    tournaments: [],
    teams: [],
    stadiums: [],
    coaches: [],
    players: [],
  });

  // Ant Design Popup Modals & Drawers visibility state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLiveControlOpen, setIsLiveControlOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [isStadiumModalOpen, setIsStadiumModalOpen] = useState(false);
  const [editingStadium, setEditingStadium] = useState(null);
  const [stadiumForm, setStadiumForm] = useState({
    name: "",
    capacity: "",
    builtYear: "",
    city: "",
    country: "",
    image: "",
  });
  const [uploadingStadiumImage, setUploadingStadiumImage] = useState(false);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [personForm, setPersonForm] = useState({
    name: "",
    kind: "Player",
    nationality: "",
    dateOfBirth: "",
    avatar: "",
    position: "",
    jerseyNumber: "",
    currentTeam: "",
    careerSummary: "",
  });
  const [uploadingPersonImage, setUploadingPersonImage] = useState(false);
  const [playerSearchTerm, setPlayerSearchTerm] = useState("");
  const [coachSearchTerm, setCoachSearchTerm] = useState("");
  const [editTeamForm, setEditTeamForm] = useState({
    name: "",
    shortName: "",
    city: "",
    country: "",
    homeStadium: "",
    coach: null,
    coachName: "",
    logo: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadDataFromDB = async () => {
    setLoading(true);
    const [dbData, playersData, coachesData] = await Promise.all([
      fetchDashboardOverview(),
      fetchPersons("Player"),
      fetchPersons("Coach"),
    ]);

    const nextData = {
      ...dbData,
      players: Array.isArray(playersData) ? playersData : [],
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
      logo: team?.logo || "",
    });
    setIsEditTeamModalOpen(true);
  };

  const handleEditTeamSubmit = async () => {
    if (!editingTeam) return;

    try {
      const payload = {
        ...editTeamForm,
        logo: editTeamForm.logo || editingTeam?.logo || "",
        image: editTeamForm.logo || editingTeam?.logo || "",
      };

      if (!payload.logo) {
        delete payload.logo;
        delete payload.image;
      }

      const response = await updateTeam(editingTeam._id, payload);
      message.success("Cập nhật thông tin đội bóng thành công!");
      setData((prev) => ({
        ...prev,
        teams: prev.teams.map((team) => (team._id === editingTeam._id ? { ...team, ...response.team } : team)),
      }));

      if (response?.team?.logo) {
        setEditTeamForm((prev) => ({ ...prev, logo: response.team.logo }));
      }
      setIsEditTeamModalOpen(false);
      setEditingTeam(null);
    } catch (error) {
      message.error(error?.response?.data?.message || "Không thể cập nhật đội bóng");
    }
  };

  const handleTeamImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploadingImage(true);
      const response = await fetch("http://localhost:3000/api/teams/upload-image", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Không thể tải ảnh lên");
      }

      setEditTeamForm((prev) => ({ ...prev, logo: result.imageUrl }));
      message.success("Tải ảnh logo thành công");
    } catch (error) {
      message.error(error?.message || "Không thể tải ảnh lên");
    } finally {
      setUploadingImage(false);
    }
  };

  const openStadiumModal = (stadium = null) => {
    setEditingStadium(stadium);
    setStadiumForm({
      name: stadium?.name || "",
      capacity: stadium?.capacity || "",
      builtYear: stadium?.builtYear || "",
      city: stadium?.city || "",
      country: stadium?.country || "",
      image: stadium?.image || "",
    });
    setIsStadiumModalOpen(true);
  };

  const handleStadiumSubmit = async () => {
    try {
      const payload = {
        ...stadiumForm,
        capacity: Number(stadiumForm.capacity),
        builtYear: Number(stadiumForm.builtYear),
      };

      const response = editingStadium
        ? await updateStadium(editingStadium._id, payload)
        : await createStadium(payload);

      message.success(editingStadium ? "Cập nhật sân vận động thành công" : "Thêm sân vận động thành công");
      await loadDataFromDB();
      setIsStadiumModalOpen(false);
      setEditingStadium(null);
    } catch (error) {
      message.error(error?.response?.data?.message || "Không thể lưu sân vận động");
    }
  };

  const handleStadiumImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploadingStadiumImage(true);
      const response = await fetch("http://localhost:3000/api/teams/upload-image", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.message || "Không thể tải ảnh lên");
      setStadiumForm((prev) => ({ ...prev, image: result.imageUrl }));
      message.success("Tải ảnh sân vận động thành công");
    } catch (error) {
      message.error(error?.message || "Không thể tải ảnh lên");
    } finally {
      setUploadingStadiumImage(false);
    }
  };

  const openPersonModal = (person = null) => {
    setEditingPerson(person);
    setPersonForm({
      name: person?.name || "",
      kind: person?.kind || "Player",
      nationality: person?.nationality || "",
      dateOfBirth: person?.dateOfBirth ? new Date(person.dateOfBirth).toISOString().split("T")[0] : "",
      avatar: person?.avatar || "",
      position: person?.position || "",
      jerseyNumber: person?.jerseyNumber || "",
      currentTeam: person?.currentTeam?._id || person?.currentTeam || "",
      careerSummary: person?.careerSummary || "",
    });
    setIsPersonModalOpen(true);
  };

  const handlePersonSubmit = async () => {
    try {
      const payload = {
        ...personForm,
        kind: personForm.kind,
        currentTeam: personForm.currentTeam || undefined,
        jerseyNumber: personForm.jerseyNumber ? Number(personForm.jerseyNumber) : undefined,
      };

      const response = editingPerson
        ? await updatePerson(editingPerson._id, payload)
        : await createPerson(payload);

      message.success(editingPerson ? "Cập nhật nhân sự thành công" : "Thêm nhân sự thành công");
      await loadDataFromDB();
      setIsPersonModalOpen(false);
      setEditingPerson(null);
    } catch (error) {
      message.error(error?.response?.data?.message || "Không thể lưu nhân sự");
    }
  };

  const handlePersonImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploadingPersonImage(true);
      const response = await fetch("http://localhost:3000/api/teams/upload-image", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.message || "Không thể tải ảnh lên");
      setPersonForm((prev) => ({ ...prev, avatar: result.imageUrl }));
      message.success("Tải ảnh nhân sự thành công");
    } catch (error) {
      message.error(error?.message || "Không thể tải ảnh lên");
    } finally {
      setUploadingPersonImage(false);
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
  const isStadiumsView = activeTab === "stadiums";
  const isLiveControlView = activeTab === "live";

  const filteredTeams = (data.teams || []).filter((team) => {
    const keyword = searchTerm.toLowerCase();
    return !keyword || [team.name, team.shortName, team.city, team.homeStadium, team.coachName]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword));
  });

  const filteredStadiums = (data.stadiums || []).filter((stadium) => {
    const keyword = stadiumSearchTerm.toLowerCase();
    return !keyword || [stadium.name, stadium.city, stadium.country]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword));
  });

  const filteredPlayers = (data.players || []).filter((person) => {
    const keyword = playerSearchTerm.toLowerCase();
    return !keyword || [person.name, person.nationality, person.position, person?.currentTeam?.name]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword));
  });

  const filteredCoaches = (data.coaches || []).filter((person) => {
    const keyword = coachSearchTerm.toLowerCase();
    return !keyword || [person.name, person.nationality, person?.currentTeam?.name, person.careerSummary]
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
          <LeaguesView
            loading={loading}
            tournaments={data.tournaments}
            matches={data.matches}
            teams={data.teams}
            stadiums={data.stadiums}
            players={data.players}
            onBack={() => setActiveTab("dashboard")}
          />
        </div>
      </div>
    );
  }

  if (isLiveControlView) {
    return (
      <div className="flex min-h-screen bg-[#f8faf9] text-slate-900 font-sans antialiased">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader title="Điều khiển trực tiếp" />
          <LiveControlView
            loading={loading}
            matches={data.matches}
            players={data.players}
            onOpenLiveControl={handleOpenLiveControl}
            onBack={() => setActiveTab("dashboard")}
          />
        </div>

        <LiveControlDrawer
          visible={isLiveControlOpen}
          onClose={() => setIsLiveControlOpen(false)}
          match={selectedMatch}
          onEventTriggered={loadDataFromDB}
        />
      </div>
    );
  }

  if (isStadiumsView) {
    return (
      <div className="flex min-h-screen bg-[#f8faf9] text-slate-900 font-sans antialiased">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader title="Quản lý sân vận động" />
          <StadiumsView
            loading={loading}
            stadiumSearchTerm={stadiumSearchTerm}
            onStadiumSearchChange={setStadiumSearchTerm}
            filteredStadiums={filteredStadiums}
            onAddStadium={() => openStadiumModal()}
            onEditStadium={(stadium) => openStadiumModal(stadium)}
          />
        </div>

        <StadiumModal
          visible={isStadiumModalOpen}
          editingStadium={editingStadium}
          onCancel={() => {
            setIsStadiumModalOpen(false);
            setEditingStadium(null);
          }}
          onOk={handleStadiumSubmit}
          form={stadiumForm}
          onFieldChange={(field, value) => setStadiumForm((prev) => ({ ...prev, [field]: value }))}
          onImageUpload={handleStadiumImageUpload}
          uploadingImage={uploadingStadiumImage}
        />
      </div>
    );
  }

  if (activeTab === "personnel") {
    return (
      <div className="flex min-h-screen bg-[#f8faf9] text-slate-900 font-sans antialiased">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader title="Quản lý cầu thủ & HLV" />
          <PersonnelView
            loading={loading}
            playerSearchTerm={playerSearchTerm}
            coachSearchTerm={coachSearchTerm}
            onPlayerSearchChange={setPlayerSearchTerm}
            onCoachSearchChange={setCoachSearchTerm}
            filteredPlayers={filteredPlayers}
            filteredCoaches={filteredCoaches}
            onAddPlayer={() => openPersonModal({ kind: "Player" })}
            onAddCoach={() => openPersonModal({ kind: "Coach" })}
            onEditPerson={(person) => openPersonModal(person)}
          />
        </div>

        <PersonModal
          visible={isPersonModalOpen}
          editingPerson={editingPerson}
          onCancel={() => {
            setIsPersonModalOpen(false);
            setEditingPerson(null);
          }}
          onOk={handlePersonSubmit}
          form={personForm}
          onFieldChange={(field, value) => setPersonForm((prev) => ({ ...prev, [field]: value }))}
          onImageUpload={handlePersonImageUpload}
          uploadingImage={uploadingPersonImage}
          teams={data.teams}
        />
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
            <PageHeader
              title="Tìm kiếm thông tin đội bóng"
              description="Nhập tên đội, tên viết tắt, thành phố hoặc sân nhà để tra cứu thông tin nhanh."
              action={
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-gray-200 text-xs shadow-xs transition-colors"
                >
                  Quay lại tổng quan
                </button>
              }
            />

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

        <TeamEditModal
          visible={isEditTeamModalOpen}
          onCancel={() => setIsEditTeamModalOpen(false)}
          onOk={handleEditTeamSubmit}
          form={editTeamForm}
          onFieldChange={(field, value) => setEditTeamForm((prev) => ({ ...prev, [field]: value }))}
          onImageUpload={handleTeamImageUpload}
          uploadingImage={uploadingImage}
          stadiums={data.stadiums}
          coaches={data.coaches}
        />
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
            {/* Left Primary Column: Ongoing & Finished Matches */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              <OngoingMatches
                title="Trận đấu đang/sắp diễn ra"
                matches={(data.matches || []).filter(m => m.status !== "FINISHED")}
                loading={loading}
                onLiveControl={handleOpenLiveControl}
              />
              <OngoingMatches
                title="Trận đấu đã diễn ra"
                matches={(data.matches || []).filter(m => m.status === "FINISHED")}
                loading={loading}
                showControlBtn={false}
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
