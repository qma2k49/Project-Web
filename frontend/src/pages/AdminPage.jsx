import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/layout/AdminSidebar";
import AdminHeader from "../components/layout/AdminHeader";
import StatCard from "../components/dashboard/StatCard";
import OngoingMatches from "../components/dashboard/OngoingMatches";
import RecentActivity from "../components/dashboard/RecentActivity";
import CreateMatchModal from "../components/admin/modals/CreateMatchModal";
import LiveControlDrawer from "../components/admin/modals/LiveControlDrawer";
import { fetchDashboardOverview, fetchPersons, updateTeam, createTeam, createStadium, updateStadium, createPerson, updatePerson, createTournament, updateTournament, syncKnockoutStages, uploadImage, deleteTournament, deleteTeam } from "../api";
import { Download, Plus, Trophy, Tv, Users, Cloud, RefreshCw, Search, Pencil, Upload } from "lucide-react";
import { Modal, message, Input } from "antd";
import { LeaguesView, TeamsView, StadiumsView, PersonnelView, LiveControlView, PageHeader, PredictionsView } from "../components/admin";
import TeamEditModal from "../components/admin/modals/TeamEditModal";
import StadiumModal from "../components/admin/modals/StadiumModal";
import PersonModal from "../components/admin/modals/PersonModal";
import TournamentModal from "../components/admin/modals/TournamentModal";
import KnockoutStagesModal from "../components/admin/modals/KnockoutStagesModal";

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
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [isKnockoutModalOpen, setIsKnockoutModalOpen] = useState(false);
  const [selectedKnockoutTournament, setSelectedKnockoutTournament] = useState(null);
  const [tournamentForm, setTournamentForm] = useState({
    name: "",
    season: "2026",
    type: "LEAGUE",
    startDate: "",
    endDate: "",
    groupA: [],
    groupB: [],
  });
  const [stadiumForm, setStadiumForm] = useState({
    name: "",
    capacity: "",
    builtYear: "",
    city: "",
    country: "",
    image: "",
  });
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
  const [uploadingStadiumImage, setUploadingStadiumImage] = useState(false);
  const [uploadingPersonImage, setUploadingPersonImage] = useState(false);
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

  const openTeamModal = async (team = null) => {
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
      coach: selectedCoachId || "",
      coachName: team?.coachName || "",
      logo: team?.logo || "",
    });
    setIsEditTeamModalOpen(true);
  };

  const handleEditTeamSubmit = async () => {
    try {
      const logo = editTeamForm.logo?.trim() || editingTeam?.logo || "";
      const payload = { ...editTeamForm, logo, image: logo };

      const token = localStorage.getItem("token") || "";
      const response = editingTeam && editingTeam._id
        ? await updateTeam(editingTeam._id, payload, token)
        : await createTeam(payload, token);

      message.success(editingTeam && editingTeam._id ? "Cập nhật thông tin đội bóng thành công!" : "Thêm đội bóng mới thành công!");
      await loadDataFromDB();

      setIsEditTeamModalOpen(false);
      setEditingTeam(null);
    } catch (error) {
      message.error(error?.response?.data?.message || "Không thể lưu thông tin đội bóng");
    }
  };

  const handleTeamImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploadingImage(true);
      const result = await uploadImage(formData);
      setEditTeamForm((prev) => ({ ...prev, logo: result.imageUrl }));
      message.success("Tải ảnh logo thành công");
    } catch (error) {
      message.error(error?.message || "Không thể tải ảnh lên");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleStadiumImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploadingStadiumImage(true);
      const result = await uploadImage(formData);
      setStadiumForm((prev) => ({ ...prev, image: result.imageUrl }));
      message.success("Tải ảnh sân vận động thành công");
    } catch (error) {
      message.error(error?.message || "Không thể tải ảnh lên");
    } finally {
      setUploadingStadiumImage(false);
    }
  };

  const handlePersonImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploadingPersonImage(true);
      const result = await uploadImage(formData);
      setPersonForm((prev) => ({ ...prev, avatar: result.imageUrl }));
      message.success("Tải ảnh nhân sự thành công");
    } catch (error) {
      message.error(error?.message || "Không thể tải ảnh lên");
    } finally {
      setUploadingPersonImage(false);
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

  const openTournamentModal = (tournament = null) => {
    setEditingTournament(tournament);

    let groupATeams = [];
    let groupBTeams = [];
    if (tournament && tournament.type === "CUP" && Array.isArray(tournament.groups)) {
      const groupA = tournament.groups.find(g => g.name === "Bảng A");
      const groupB = tournament.groups.find(g => g.name === "Bảng B");
      if (groupA && Array.isArray(groupA.teams)) {
        groupATeams = groupA.teams.map(t => typeof t === "object" ? t._id || t.id : t);
      }
      if (groupB && Array.isArray(groupB.teams)) {
        groupBTeams = groupB.teams.map(t => typeof t === "object" ? t._id || t.id : t);
      }
    }

    setTournamentForm({
      name: tournament?.name || "",
      season: tournament?.season || "2026",
      type: tournament?.type || "LEAGUE",
      startDate: tournament?.startDate ? new Date(tournament.startDate).toISOString().split("T")[0] : "",
      endDate: tournament?.endDate ? new Date(tournament.endDate).toISOString().split("T")[0] : "",
      groupA: groupATeams,
      groupB: groupBTeams,
    });
    setIsTournamentModalOpen(true);
  };

  const handleTournamentSubmit = async () => {
    try {
      const payload = {
        name: tournamentForm.name,
        season: tournamentForm.season,
        type: tournamentForm.type,
        startDate: tournamentForm.startDate ? new Date(tournamentForm.startDate) : null,
        endDate: tournamentForm.endDate ? new Date(tournamentForm.endDate) : null,
      };

      if (tournamentForm.type === "CUP") {
        payload.groups = [
          { name: "Bảng A", teams: tournamentForm.groupA || [] },
          { name: "Bảng B", teams: tournamentForm.groupB || [] },
        ];
      }

      const token = localStorage.getItem("token") || "";
      const response = editingTournament
        ? await updateTournament(editingTournament._id, payload, token)
        : await createTournament(payload, token);

      message.success(editingTournament ? "Cập nhật giải đấu thành công!" : "Tạo giải đấu mới thành công!");
      await loadDataFromDB();
      setIsTournamentModalOpen(false);
      setEditingTournament(null);
    } catch (error) {
      message.error(error?.response?.data?.message || "Không thể lưu giải đấu");
    }
  };

  const handleDeleteTournament = async (tournamentId) => {
    try {
      const token = localStorage.getItem("token") || "";
      await deleteTournament(tournamentId, token);
      message.success("Xóa giải đấu thành công!");
      await loadDataFromDB();
    } catch (error) {
      message.error(error?.response?.data?.message || "Không thể xóa giải đấu");
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      const token = localStorage.getItem("token") || "";
      await deleteTeam(teamId, token);
      message.success("Xóa đội bóng thành công!");
      await loadDataFromDB();
    } catch (error) {
      message.error(error?.response?.data?.message || "Không thể xóa đội bóng");
    }
  };

  const openKnockoutModal = (tournament) => {
    setSelectedKnockoutTournament(tournament);
    setIsKnockoutModalOpen(true);
  };

  const handleKnockoutSubmit = async (payload) => {
    try {
      const token = localStorage.getItem("token") || "";
      await syncKnockoutStages(selectedKnockoutTournament._id, payload.stages, token);
      message.success("Cấu hình vòng loại trực tiếp thành công!");
      await loadDataFromDB();
      setIsKnockoutModalOpen(false);
      setSelectedKnockoutTournament(null);
    } catch (error) {
      message.error(error?.response?.data?.message || "Không thể lưu cấu hình");
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

      const response = editingPerson && editingPerson._id
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

  if (activeTab === "predictions") {
    return (
      <div className="flex min-h-screen bg-[#f8faf9] text-slate-900 font-sans antialiased">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader title="Quản lý nhận định & BXH" />
          <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
            <PredictionsView tournaments={data.tournaments} loadingOverview={loading} />
          </main>
        </div>
      </div>
    );
  }

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
            onAddTournament={() => openTournamentModal(null)}
            onEditTournament={openTournamentModal}
            onConfigureKnockoutStages={openKnockoutModal}
            onDeleteTournament={handleDeleteTournament}
          />
        </div>

        <TournamentModal
          visible={isTournamentModalOpen}
          onCancel={() => {
            setIsTournamentModalOpen(false);
            setEditingTournament(null);
          }}
          onOk={handleTournamentSubmit}
          form={tournamentForm}
          onFieldChange={(field, value) => setTournamentForm((prev) => ({ ...prev, [field]: value }))}
          teams={data.teams}
          editingTournament={editingTournament}
        />

        <KnockoutStagesModal
          visible={isKnockoutModalOpen}
          onCancel={() => {
            setIsKnockoutModalOpen(false);
            setSelectedKnockoutTournament(null);
          }}
          onOk={handleKnockoutSubmit}
          tournament={selectedKnockoutTournament}
        />
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
          <TeamsView
            loading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filteredTeams={filteredTeams}
            onEditTeam={openTeamModal}
            onDeleteTeam={handleDeleteTeam}
            onBack={() => setActiveTab("dashboard")}
            data={data}
            onAddTeam={() => openTeamModal(null)}
          />
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
          editingTeam={editingTeam}
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
        <AdminHeader title={`Chào mừng đến với trang quản trị`} />

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
