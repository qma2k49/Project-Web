import React, { useState, useEffect } from "react";
import { Table, Button, Modal, InputNumber, Select, Input, Tag, Spin, message, Tooltip } from "antd";
import {
  Sparkles,
  Trophy,
  Users,
  Award,
  RefreshCw,
  Edit3,
  Calendar,
  Search,
  CheckCircle,
  Coins,
  Flame,
  User
} from "lucide-react";
import { fetchAllPredictions, fetchPredictionLeaderboard, updateLeaderboardScore, recalculatePredictionPoints } from "../../api";

const PredictionsView = ({ tournaments = [], loadingOverview = false }) => {
  const [predictions, setPredictions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("leaderboard"); // leaderboard, list
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  
  // Search states
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [matchSearchTerm, setMatchSearchTerm] = useState("");

  // Edit points modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    totalPoints: 0,
    exactMatches: 0,
    correctResults: 0
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    if (tournaments && tournaments.length > 0) {
      setSelectedTournamentId(tournaments[0]._id || tournaments[0].id);
    }
  }, [tournaments]);

  const loadData = async () => {
    try {
      setLoading(true);
      const promises = [fetchAllPredictions(token)];
      if (selectedTournamentId) {
        promises.push(fetchPredictionLeaderboard(selectedTournamentId));
      }
      
      const results = await Promise.all(promises);
      const allPreds = results[0];
      setPredictions(Array.isArray(allPreds) ? allPreds : []);
      
      if (selectedTournamentId && results[1]) {
        setLeaderboard(Array.isArray(results[1]) ? results[1] : []);
      } else {
        setLeaderboard([]);
      }
    } catch (error) {
      console.error("Lỗi tải thông tin nhận định:", error);
      message.error("Lỗi tải thông tin nhận định!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTournamentId]);

  const handleRecalculate = async () => {
    if (!selectedTournamentId) return;
    Modal.confirm({
      title: "Xác nhận tính toán lại điểm số",
      content: "Hệ thống sẽ quét toàn bộ nhận định của giải đấu này và tính toán lại điểm số dựa trên kết quả thực tế của các trận đấu đã kết thúc. Bạn có chắc chắn muốn thực hiện?",
      okText: "Tính toán lại",
      cancelText: "Hủy bỏ",
      okType: "danger",
      onOk: async () => {
        try {
          setRecalculating(true);
          const res = await recalculatePredictionPoints(selectedTournamentId, token);
          message.success(res?.message || "Đã recalculate điểm số thành công!");
          await loadData();
        } catch (error) {
          message.error(error.response?.data?.message || "Lỗi recalculate điểm số!");
        } finally {
          setRecalculating(false);
        }
      }
    });
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setEditForm({
      totalPoints: record.totalPoints || 0,
      exactMatches: record.exactMatches || 0,
      correctResults: record.correctResults || 0
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingRecord) return;
    try {
      setSubmittingEdit(true);
      const recordId = editingRecord._id || editingRecord.id;
      await updateLeaderboardScore(recordId, editForm, token);
      message.success("Cập nhật điểm bảng xếp hạng thành công!");
      setIsEditModalOpen(false);
      setEditingRecord(null);
      await loadData();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi cập nhật điểm số!");
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Filtered lists
  const filteredLeaderboard = leaderboard.filter(item => {
    const username = item.userId?.userName || "";
    return username.toLowerCase().includes(userSearchTerm.toLowerCase());
  });

  const filteredPredictions = predictions.filter(pred => {
    const username = pred.userId?.userName || "";
    const homeTeam = pred.matchId?.homeTeam?.name || "";
    const awayTeam = pred.matchId?.awayTeam?.name || "";

    const keyword = matchSearchTerm.toLowerCase();
    return username.toLowerCase().includes(keyword) || 
           homeTeam.toLowerCase().includes(keyword) || 
           awayTeam.toLowerCase().includes(keyword);
  });

  // Stats calculation
  const totalSubmissions = filteredPredictions.length;
  const totalUniqueUsers = new Set(predictions.map(p => p.userId?._id || p.userId?.id)).size;
  const x2BoostCount = predictions.filter(p => p.x2Bonus).length;
  const totalPointsAwarded = leaderboard.reduce((sum, item) => sum + (item.totalPoints || 0), 0);

  // Leaderboard columns
  const leaderboardColumns = [
    {
      title: "Hạng",
      key: "rank",
      align: "center",
      width: 70,
      render: (_, __, index) => {
        const colors = ["bg-amber-400 text-amber-950", "bg-slate-300 text-slate-900", "bg-amber-600 text-white"];
        if (index < 3) {
          return (
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${colors[index]} mx-auto shadow-2xs`}>
              {index + 1}
            </div>
          );
        }
        return <span className="font-mono text-slate-500 font-bold">{index + 1}</span>;
      }
    },
    {
      title: "Người chơi",
      dataIndex: ["userId", "userName"],
      key: "username",
      render: (text) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <User className="w-4 h-4 text-emerald-700" />
          </div>
          <span className="font-extrabold text-slate-800 text-xs">{text || "Thành viên"}</span>
        </div>
      )
    },
    {
      title: "Tổng Điểm tích lũy",
      dataIndex: "totalPoints",
      key: "totalPoints",
      align: "center",
      sorter: (a, b) => a.totalPoints - b.totalPoints,
      render: (pts) => (
        <span className="font-mono font-black text-emerald-600 text-sm">
          {pts || 0}đ
        </span>
      )
    }
  ];

  // Predictions List columns
  const predictionColumns = [
    {
      title: "Giải đấu / Vòng",
      key: "tournament",
      width: 160,
      render: (_, record) => {
        const match = record.matchId;
        if (!match) return <span className="text-slate-400 text-xs">-</span>;
        const tourName = typeof match.tournamentId === "object" ? match.tournamentId?.name : "ASEAN Hyundai Cup";
        return (
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-800 text-xs truncate max-w-[140px] block" title={tourName}>{tourName}</span>
            <span className="text-[10px] text-slate-400 font-semibold">Vòng {match.round}</span>
          </div>
        );
      }
    },
    {
      title: "Người chơi",
      dataIndex: ["userId", "userName"],
      key: "username",
      width: 150,
      render: (text) => <span className="font-extrabold text-slate-800 text-xs">{text || "Thành viên"}</span>
    },
    {
      title: "Trận đấu",
      key: "matchup",
      width: 280,
      render: (_, record) => {
        const match = record.matchId;
        if (!match) return <span className="text-slate-400 text-xs">Trận đấu không tồn tại</span>;
        
        return (
          <div className="flex items-center gap-2 text-xs">
            {/* Home */}
            <div className="flex items-center gap-1 w-[100px] justify-end">
              <span className="font-bold text-slate-800 truncate" title={match.homeTeam?.name}>
                {match.homeTeam?.shortName || match.homeTeam?.name}
              </span>
              {match.homeTeam?.logo ? (
                <img src={match.homeTeam.logo} alt="" className="w-5 h-5 rounded-full object-cover bg-white border border-slate-100" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold">?</div>
              )}
            </div>

            <div className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-500">
              VS
            </div>

            {/* Away */}
            <div className="flex items-center gap-1 w-[100px]">
              {match.awayTeam?.logo ? (
                <img src={match.awayTeam.logo} alt="" className="w-5 h-5 rounded-full object-cover bg-white border border-slate-100" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold">?</div>
              )}
              <span className="font-bold text-slate-800 truncate" title={match.awayTeam?.name}>
                {match.awayTeam?.shortName || match.awayTeam?.name}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      title: "Dự đoán Tỷ số",
      key: "predictedScore",
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          <span className="font-mono font-black text-slate-800 text-sm">
            {record.predictedHomeScore} - {record.predictedAwayScore}
          </span>
          {record.x2Bonus && (
            <Tooltip title="Sử dụng boost x2 điểm">
              <span className="text-[8px] font-black bg-amber-400 text-amber-950 px-1 py-0.2 rounded border border-amber-305">X2</span>
            </Tooltip>
          )}
        </div>
      )
    },
    {
      title: "Cầu thủ ghi bàn đầu",
      dataIndex: ["firstScorePlayer", "name"],
      key: "scorer",
      render: (name, record) => {
        if (!name) return <span className="text-slate-400 text-[10.5px]">Không chọn</span>;
        const jNumber = record.firstScorePlayer?.jerseyNumber;
        return (
          <span className="font-bold text-slate-700 text-xs">
            ⚽ {jNumber !== undefined ? `#${jNumber} ` : ""}{name}
          </span>
        );
      }
    },
    {
      title: "Tỉ số thực",
      key: "realScore",
      align: "center",
      render: (_, record) => {
        const match = record.matchId;
        if (!match || match.status !== "FINISHED") {
          return <Tag color="default" className="text-[10px] font-bold">Chưa đá xong</Tag>;
        }
        return (
          <span className="font-mono font-black text-slate-500 text-xs">
            {match.homeScore} - {match.awayScore}
          </span>
        );
      }
    },
    {
      title: "Điểm cộng",
      dataIndex: "pointsEarned",
      key: "pointsEarned",
      align: "center",
      render: (pts, record) => {
        const match = record.matchId;
        if (!match || match.status !== "FINISHED") {
          return <span className="text-slate-400 font-semibold text-xs">⏳ Đang chờ</span>;
        }
        return (
          <span className={`font-mono font-black text-xs px-2 py-0.5 rounded ${
            pts > 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-400"
          }`}>
            +{pts || 0}đ
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Action Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5.5 h-5.5 text-emerald-600" />
            Bảng Điều khiển Quản lý Nhận định
          </h2>
          <p className="text-xs text-slate-450 font-medium mt-1">
            Theo dõi danh sách dự đoán tỷ số của người dùng, xếp hạng điểm tích lũy và cập nhật thủ công nếu cần thiết.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          {/* Tournament filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Giải đấu:</span>
            <Select
              className="w-48 font-bold"
              value={selectedTournamentId}
              onChange={(val) => setSelectedTournamentId(val)}
              options={tournaments.map(t => ({
                value: t._id || t.id,
                label: t.name
              }))}
            />
          </div>

          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="inline-flex items-center gap-2 bg-[#0c1726] hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? "animate-spin" : ""}`} />
            Tính lại điểm số
          </button>
        </div>
      </div>

      {/* Grid statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-2xs">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tổng nhận định</span>
              <h3 className="text-2xl font-black text-slate-800">{totalSubmissions}</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <Flame className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-2xs">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Thành viên tham gia</span>
              <h3 className="text-2xl font-black text-slate-800">{totalUniqueUsers}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-2xs">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Lượt dùng Boost X2</span>
              <h3 className="text-2xl font-black text-slate-800">{x2BoostCount}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-505" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-2xs">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tổng điểm đã trao</span>
              <h3 className="text-2xl font-black text-slate-800">{totalPointsAwarded}đ</h3>
            </div>
            <div className="p-2.5 bg-purple-50 rounded-xl">
              <Coins className="w-5 h-5 text-purple-650" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content table area */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs space-y-6">
        {/* Tab selection */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSubTab("leaderboard")}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                activeSubTab === "leaderboard"
                  ? "bg-emerald-500 text-white shadow-2xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              🏆 Bảng xếp hạng dự đoán
            </button>
            <button
              onClick={() => setActiveSubTab("list")}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                activeSubTab === "list"
                  ? "bg-emerald-500 text-white shadow-2xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              📋 Danh sách dự đoán chi tiết
            </button>
          </div>

          {/* Quick Filters */}
          <div>
            {activeSubTab === "leaderboard" ? (
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm theo username..."
                  className="pl-9 text-xs rounded-xl"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                />
              </div>
            ) : (
              <div className="relative w-72">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm theo username hoặc tên đội bóng..."
                  className="pl-9 text-xs rounded-xl"
                  value={matchSearchTerm}
                  onChange={(e) => setMatchSearchTerm(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Content body Table */}
        <div className="overflow-hidden">
          {loading ? (
            <div className="py-16 text-center flex flex-col items-center gap-3">
              <Spin size="large" />
              <span className="text-slate-400 font-semibold text-xs animate-pulse">Đang tải dữ liệu nhận định từ server...</span>
            </div>
          ) : activeSubTab === "leaderboard" ? (
            <Table
              dataSource={filteredLeaderboard}
              columns={leaderboardColumns}
              rowKey={(record) => record._id || record.id}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              className="custom-admin-table font-semibold text-xs"
            />
          ) : (
            <Table
              dataSource={filteredPredictions}
              columns={predictionColumns}
              rowKey={(record) => record._id || record.id}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              className="custom-admin-table font-semibold text-xs"
            />
          )}
        </div>
      </div>

      {/* Points Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <Award className="w-5 h-5 text-emerald-600" />
            <span className="font-black text-slate-800 text-sm tracking-tight">
              Sửa điểm dự đoán: {editingRecord?.userId?.userName}
            </span>
          </div>
        }
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        confirmLoading={submittingEdit}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingRecord(null);
        }}
        okText="Cập nhật"
        cancelText="Hủy bỏ"
        centered
        width={380}
      >
        {editingRecord && (
          <div className="my-5 space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-505 uppercase tracking-wider">
                Tổng điểm tích lũy
              </label>
              <InputNumber
                min={0}
                max={1000}
                className="w-full rounded-xl"
                size="large"
                value={editForm.totalPoints}
                onChange={(val) => setEditForm(prev => ({ ...prev, totalPoints: val || 0 }))}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PredictionsView;
