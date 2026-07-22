import React, { useState, useEffect } from "react";
import { Modal, Select, Button, message, Spin } from "antd";
import { Users, AlertCircle, Save, CheckCircle2, X } from "lucide-react";
import { fetchMatchLineups, saveMatchLineup } from "../../../api";

const { Option } = Select;

const MatchLineupModal = ({ visible, onClose, match, players = [] }) => {
  const [activeTab, setActiveTab] = useState("home"); // "home" | "away"
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingSlotIndex, setEditingSlotIndex] = useState(null); // Track which slot is being edited

  // Home Team state
  const [homeFormation, setHomeFormation] = useState("4-3-3");
  const [homeStartingXI, setHomeStartingXI] = useState([]); // Array of player IDs representing visual slots
  const [homeSubstitutes, setHomeSubstitutes] = useState([]);

  // Away Team state
  const [awayFormation, setAwayFormation] = useState("4-3-3");
  const [awayStartingXI, setAwayStartingXI] = useState([]); // Array of player IDs representing visual slots
  const [awaySubstitutes, setAwaySubstitutes] = useState([]);

  const getTeamId = (team) => {
    if (!team) return null;
    return typeof team === "object" ? team._id : team;
  };

  const getTeamName = (team) => {
    if (!team) return "Đội bóng";
    return typeof team === "object" ? team.name : "Đội bóng";
  };

  const getTeamLogo = (team) => {
    if (team && typeof team === "object" && team.logo) {
      return team.logo;
    }
    return null;
  };

  const homeId = getTeamId(match?.homeTeam);
  const awayId = getTeamId(match?.awayTeam);

  const homeName = getTeamName(match?.homeTeam);
  const awayName = getTeamName(match?.awayTeam);

  const homeLogo = getTeamLogo(match?.homeTeam);
  const awayLogo = getTeamLogo(match?.awayTeam);

  // Filter players belonging to the teams
  const homeTeamPlayers = players.filter((p) => {
    const pTeamId = typeof p.currentTeam === "object" ? p.currentTeam?._id : p.currentTeam;
    return pTeamId === homeId;
  });

  const awayTeamPlayers = players.filter((p) => {
    const pTeamId = typeof p.currentTeam === "object" ? p.currentTeam?._id : p.currentTeam;
    return pTeamId === awayId;
  });

  // Calculate coordinates for the 11 nodes based on formation
  const getLineupSlots = (formation) => {
    const slots = [];
    // Goalkeeper is always at index 0 (bottom center)
    slots.push({ index: 0, role: "GK", label: "GK", top: 85, left: 50 });

    const parts = formation.split("-").map(Number);
    const rowsCount = parts.length;

    let currentSlotIndex = 1;
    parts.forEach((count, rowIndex) => {
      // Row top positions distributed vertically on the pitch
      let top = 65;
      if (rowsCount === 3) {
        if (rowIndex === 0) top = 65; // Defenders
        else if (rowIndex === 1) top = 42; // Midfielders
        else top = 18; // Forwards
      } else if (rowsCount === 4) {
        if (rowIndex === 0) top = 65; // Defenders
        else if (rowIndex === 1) top = 48; // Defensive Midfielders
        else if (rowIndex === 2) top = 32; // Attacking Midfielders
        else top = 18; // Forwards
      }

      // Determine role label
      let role = "DF";
      if (rowIndex === 0) role = "DF";
      else if (rowIndex === rowsCount - 1) role = "FW";
      else role = "MF";

      for (let i = 0; i < count; i++) {
        // Evenly distribute left coordinates across width
        const left = ((i + 1) * 100) / (count + 1);
        slots.push({
          index: currentSlotIndex,
          role,
          label: `${role}${i + 1}`,
          top,
          left,
        });
        currentSlotIndex++;
      }
    });

    return slots;
  };

  // Maps flat MongoDB player IDs to slot indices based on their position (GK, DF, MF, FW)
  const distributePlayersToSlots = (playerIds, formation) => {
    const slots = getLineupSlots(formation);
    const result = new Array(slots.length).fill(null);

    const playerObjects = playerIds
      .map((id) => players.find((p) => p._id === id))
      .filter(Boolean);

    const gks = playerObjects.filter((p) => p.position === "GK");
    const dfs = playerObjects.filter((p) => p.position === "DF");
    const mfs = playerObjects.filter((p) => p.position === "MF");
    const fws = playerObjects.filter((p) => p.position === "FW");

    let gkIdx = 0, dfIdx = 0, mfIdx = 0, fwIdx = 0;
    slots.forEach((slot) => {
      if (slot.role === "GK" && gks[gkIdx]) {
        result[slot.index] = gks[gkIdx]._id;
        gkIdx++;
      } else if (slot.role === "DF" && dfs[dfIdx]) {
        result[slot.index] = dfs[dfIdx]._id;
        dfIdx++;
      } else if (slot.role === "MF" && mfs[mfIdx]) {
        result[slot.index] = mfs[mfIdx]._id;
        mfIdx++;
      } else if (slot.role === "FW" && fws[fwIdx]) {
        result[slot.index] = fws[fwIdx]._id;
        fwIdx++;
      }
    });

    // Place remaining players that weren't matched directly
    playerIds.forEach((id) => {
      if (result.includes(id)) return;
      const emptyIdx = result.indexOf(null);
      if (emptyIdx !== -1) {
        result[emptyIdx] = id;
      }
    });

    return result;
  };

  // Load existing lineups when modal opens
  useEffect(() => {
    if (!visible || !match) return;

    setActiveTab("home");
    setEditingSlotIndex(null);

    const loadLineups = async () => {
      try {
        setLoading(true);
        const data = await fetchMatchLineups(match._id);

        // Reset states
        setHomeFormation("4-3-3");
        setHomeStartingXI([]);
        setHomeSubstitutes([]);
        setAwayFormation("4-3-3");
        setAwayStartingXI([]);
        setAwaySubstitutes([]);

        if (Array.isArray(data)) {
          data.forEach((lineup) => {
            const teamId = typeof lineup.teamId === "object" ? lineup.teamId?._id : lineup.teamId;
            const startingXIIds = (lineup.startingXI || []).map((p) => (typeof p === "object" ? p._id : p));
            const substitutesIds = (lineup.substitutes || []).map((p) => (typeof p === "object" ? p._id : p));

            if (teamId === homeId) {
              const formStr = lineup.formation || "4-3-3";
              setHomeFormation(formStr);
              setHomeStartingXI(distributePlayersToSlots(startingXIIds, formStr));
              setHomeSubstitutes(substitutesIds);
            } else if (teamId === awayId) {
              const formStr = lineup.formation || "4-3-3";
              setAwayFormation(formStr);
              setAwayStartingXI(distributePlayersToSlots(startingXIIds, formStr));
              setAwaySubstitutes(substitutesIds);
            }
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải đội hình:", error);
        message.error("Không thể tải thông tin đội hình hiện tại.");
      } finally {
        setLoading(false);
      }
    };

    loadLineups();
  }, [visible, match]);

  // Rearrange starting XI if formation changes
  const handleFormationChange = (newFormation) => {
    const activeXI = activeTab === "home" ? homeStartingXI : awayStartingXI;
    const setActiveXI = activeTab === "home" ? setHomeStartingXI : setAwayStartingXI;
    const setActiveFormation = activeTab === "home" ? setHomeFormation : setAwayFormation;

    const currentPlayers = activeXI.filter(Boolean);
    setActiveFormation(newFormation);
    setActiveXI(distributePlayersToSlots(currentPlayers, newFormation));
  };

  // Assign player to visual slot
  const handleAssignPlayer = (slotIndex, playerId) => {
    const activeXI = activeTab === "home" ? homeStartingXI : awayStartingXI;
    const setActiveXI = activeTab === "home" ? setHomeStartingXI : setAwayStartingXI;

    const nextXI = [...activeXI];
    nextXI[slotIndex] = playerId || null;
    setActiveXI(nextXI);
  };

  // Handle Save
  const handleSave = async () => {
    if (!match) return;

    const currentTeamId = activeTab === "home" ? homeId : awayId;
    const currentTeamName = activeTab === "home" ? homeName : awayName;
    const formation = activeTab === "home" ? homeFormation : awayFormation;
    const startingXI = activeTab === "home" ? homeStartingXI : awayStartingXI;
    const substitutes = activeTab === "home" ? homeSubstitutes : awaySubstitutes;

    // Filter out empty slots when saving to MongoDB
    const cleanedStartingXI = startingXI.filter(Boolean);

    try {
      setSaving(true);
      const payload = {
        matchId: match._id,
        teamId: currentTeamId,
        formation,
        startingXI: cleanedStartingXI,
        substitutes,
      };

      await saveMatchLineup(payload);
      message.success(`Đã lưu đội hình cho ${currentTeamName} thành công!`);
    } catch (error) {
      console.error(error);
      message.error("Lưu đội hình thất bại: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const activePlayers = activeTab === "home" ? homeTeamPlayers : awayTeamPlayers;
  const activeStartingXI = activeTab === "home" ? homeStartingXI : awayStartingXI;
  const activeSubstitutes = activeTab === "home" ? homeSubstitutes : awaySubstitutes;
  const setActiveSubstitutes = activeTab === "home" ? setHomeSubstitutes : setAwaySubstitutes;
  const activeFormation = activeTab === "home" ? homeFormation : awayFormation;

  const activeTeamLogo = activeTab === "home" ? homeLogo : awayLogo;
  const activeTeamName = activeTab === "home" ? homeName : awayName;

  const activeXIPlayerCount = activeStartingXI.filter(Boolean).length;

  // Filter lists to prevent pick duplication
  const getAvailablePlayersForSlot = (slotIndex) => {
    const currentSelectedIdInSlot = activeStartingXI[slotIndex];
    return activePlayers.filter((p) => {
      if (p._id === currentSelectedIdInSlot) return true; // keep currently selected in this slot
      return !activeStartingXI.includes(p._id) && !activeSubstitutes.includes(p._id);
    });
  };

  const getAvailableSubPlayers = () => {
    return activePlayers.filter((p) => !activeStartingXI.includes(p._id));
  };

  const formationsList = ["4-3-3", "4-4-2", "3-5-2", "4-2-3-1", "4-1-4-1", "5-3-2", "4-5-1"];
  const currentSlots = getLineupSlots(activeFormation);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800 font-bold text-lg border-b border-slate-100 pb-3">
          <Users className="w-5.5 h-5.5 text-emerald-600" />
          <span>Sơ đồ đội hình trực quan</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" size="large" onClick={onClose}>
          Đóng
        </Button>,
        <Button
          key="save"
          type="primary"
          size="large"
          icon={<Save className="w-4 h-4" />}
          loading={saving}
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
        >
          Lưu đội hình {activeTab === "home" ? "Đội nhà" : "Đội khách"}
        </Button>,
      ]}
      destroyOnClose
      centered
      width={900}
    >
      {loading ? (
        <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
          <Spin size="large" />
          <span className="text-slate-500 font-semibold text-sm">Đang tải cấu hình đội hình...</span>
        </div>
      ) : (
        <div className="mt-4 space-y-5">
          {/* Match Info Header */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              {homeLogo ? (
                <img src={homeLogo} alt={homeName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-xs font-bold text-emerald-700">
                  {homeName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="font-bold text-slate-800 text-sm">{homeName}</span>
            </div>
            <div className="text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded-lg">VS</div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-slate-800 text-sm">{awayName}</span>
              {awayLogo ? (
                <img src={awayLogo} alt={awayName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                  {awayName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Team Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === "home"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Đội hình {homeName} (Đội nhà)
            </button>
            <button
              onClick={() => setActiveTab("away")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === "away"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Đội hình {awayName} (Đội khách)
            </button>
          </div>

          {/* Main Visual Board Setup & List Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visual Football Field (Left 8 cols) */}
            <div className="lg:col-span-8 space-y-3">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                Sơ đồ xuất phát trực quan (Nhấp vào vòng tròn để chọn)
              </span>

              {/* The Football Pitch Container */}
              <div className="relative w-full h-[470px] bg-gradient-to-b from-emerald-700 to-emerald-900 rounded-3xl border-4 border-slate-900/10 shadow-inner overflow-hidden p-4 select-none">
                {/* Field Markings */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20 -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-28 h-28 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-1/2 w-52 h-24 border-t-2 border-x-2 border-white/20 -translate-x-1/2"></div>
                <div className="absolute bottom-14 left-1/2 w-1.5 h-1.5 bg-white/30 rounded-full -translate-x-1/2"></div>
                <div className="absolute top-0 left-1/2 w-52 h-24 border-b-2 border-x-2 border-white/20 -translate-x-1/2"></div>
                <div className="absolute top-14 left-1/2 w-1.5 h-1.5 bg-white/30 rounded-full -translate-x-1/2"></div>

                {/* Render Tactical Slots */}
                {currentSlots.map((slot) => {
                  const assignedPlayerId = activeStartingXI[slot.index];
                  const player = assignedPlayerId ? players.find((p) => p._id === assignedPlayerId) : null;
                  const isEditing = editingSlotIndex === slot.index;

                  return isEditing ? (
                    <div
                      key={slot.index}
                      className="absolute z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-1.5 border border-slate-200 shadow-lg"
                      style={{ top: `${slot.top}%`, left: `${slot.left}%` }}
                    >
                      <Select
                        showSearch
                        defaultOpen
                        size="small"
                        placeholder="Chọn cầu thủ..."
                        className="w-38"
                        onBlur={() => setEditingSlotIndex(null)}
                        onChange={(val) => {
                          handleAssignPlayer(slot.index, val);
                          setEditingSlotIndex(null);
                        }}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        <Option value="">-- Trống --</Option>
                        {getAvailablePlayersForSlot(slot.index).map((p) => (
                          <Option key={p._id} value={p._id}>
                            {p.jerseyNumber ? `#${p.jerseyNumber} ` : ""}{p.name} ({p.position})
                          </Option>
                        ))}
                      </Select>
                    </div>
                  ) : (
                    <div
                      key={slot.index}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                      style={{ top: `${slot.top}%`, left: `${slot.left}%` }}
                    >
                      {/* Jersey Circle Node */}
                      <div
                        onClick={() => setEditingSlotIndex(slot.index)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-black relative border-2 transition-all duration-200 ${
                          player
                            ? activeTab === "home"
                              ? "bg-red-500 hover:bg-red-600 text-white border-white shadow-md shadow-red-500/20"
                              : "bg-blue-500 hover:bg-blue-600 text-white border-white shadow-md shadow-blue-500/20"
                            : "border-dashed border-white/40 bg-white/10 hover:bg-white/20 hover:border-white/60 text-white/60"
                        }`}
                      >
                        {player ? (
                          <span>{player.jerseyNumber || "10"}</span>
                        ) : (
                          <span className="text-[10px] tracking-tighter">{slot.label}</span>
                        )}

                        {/* Quick clear button */}
                        {player && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignPlayer(slot.index, null);
                            }}
                            className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold border border-white hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>

                      {/* Player ShortName Label */}
                      <div className={`mt-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase max-w-[85px] truncate text-center select-none shadow-xs ${
                        player
                          ? "bg-slate-900/90 text-white border border-slate-700/50"
                          : "bg-white/15 text-white/70"
                      }`}>
                        {player ? player.name.split(" ").pop() : slot.role}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tactical Settings and Bench (Right 4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Formation Choice */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Đội hình chiến thuật
                </label>
                <Select
                  size="large"
                  className="w-full"
                  value={activeFormation}
                  onChange={handleFormationChange}
                >
                  {formationsList.map((form) => (
                    <Option key={form} value={form}>
                      {form}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Substitutes Choice */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Đội hình dự bị (Bench)
                  </label>
                  <span className="text-xs font-bold text-slate-400">
                    Đã chọn: {activeSubstitutes.length}
                  </span>
                </div>
                <Select
                  mode="multiple"
                  size="large"
                  className="w-full font-medium"
                  placeholder="Chọn cầu thủ dự bị..."
                  value={activeSubstitutes}
                  onChange={setActiveSubstitutes}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {getAvailableSubPlayers().map((p) => (
                    <Option key={p._id} value={p._id}>
                      {p.jerseyNumber ? `#${p.jerseyNumber} ` : ""}{p.name} ({p.position})
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Status Banner */}
              <div className="border border-slate-200 bg-slate-50 rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Thông số đội hình:</span>
                  <span className={`${activeXIPlayerCount === 11 ? "text-emerald-600" : "text-amber-600"}`}>
                    {activeXIPlayerCount} / 11 xuất phát
                  </span>
                </div>

                {activeXIPlayerCount !== 11 ? (
                  <div className="flex items-start gap-2.5 text-amber-800 text-[11px] leading-relaxed">
                    <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      Đội hình hiện tại có <b>{activeXIPlayerCount}</b> cầu thủ. Hãy nhấp vào các vị trí trống trên sân để bổ sung đủ <b>11</b> cầu thủ.
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5 text-emerald-800 text-[11px] leading-relaxed">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      Đội hình đã được thiết lập đầy đủ và sẵn sàng thi đấu với <b>11</b> cầu thủ xuất phát.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default MatchLineupModal;
