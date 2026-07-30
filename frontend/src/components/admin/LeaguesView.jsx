import React, { useState, useEffect } from "react";
import PageHeader from "./PageHeader";
import { fetchTeamStandings, fetchKnockoutStages } from "../../api";
import { Trophy, Calendar, Users, ArrowLeft, Shield, AlertCircle, Sparkles, Pencil } from "lucide-react";
import { Spin } from "antd";
import MatchLineupModal from "./modals/MatchLineupModal";
import LiveClock from "./LiveClock";

const LeaguesView = ({ loading, tournaments, matches, teams, stadiums, players = [], isAdmin = true, onAddTournament, onEditTournament, onConfigureKnockoutStages }) => {
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [standings, setStandings] = useState([]);
  const [loadingStandings, setLoadingStandings] = useState(false);
  const [detailTab, setDetailTab] = useState("groups");

  const [selectedLineupMatch, setSelectedLineupMatch] = useState(null);
  const [isLineupModalOpen, setIsLineupModalOpen] = useState(false);
  const [knockoutStagesList, setKnockoutStagesList] = useState([]);
  const [loadingStages, setLoadingStages] = useState(false);

  const handleOpenLineupModal = (match) => {
    setSelectedLineupMatch(match);
    setIsLineupModalOpen(true);
  };

  // Load standings when a tournament is selected
  useEffect(() => {
    if (!selectedTournament) {
      setStandings([]);
      return;
    }

    setDetailTab("groups");

    const loadStandings = async () => {
      try {
        setLoadingStandings(true);
        const data = await fetchTeamStandings(selectedTournament._id);
        setStandings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Lỗi khi tải bảng xếp hạng:", error);
      } finally {
        setLoadingStandings(false);
      }
    };
    loadStandings();
  }, [selectedTournament]);

  // Load knockout stages when a tournament is selected
  useEffect(() => {
    if (selectedTournament && selectedTournament.type === "CUP") {
      const loadStages = async () => {
        try {
          setLoadingStages(true);
          const stages = await fetchKnockoutStages(selectedTournament._id);
          const filtered = (Array.isArray(stages) ? stages : []).filter(
            (s) => String(s.tournamentId?._id || s.tournamentId) === String(selectedTournament._id)
          );
          setKnockoutStagesList(filtered);
        } catch (error) {
          console.error("Lỗi lấy danh sách knockout stages:", error);
        } finally {
          setLoadingStages(false);
        }
      };
      loadStages();
    } else {
      setKnockoutStagesList([]);
    }
  }, [selectedTournament]);

  // Fallback / dynamic calculation of standings from matches
  const getStandingsForGroup = (groupName, groupTeams) => {
    // Try to filter API standings for teams in this group
    const apiStandings = standings.filter((s) => {
      const sTeamId = typeof s.teamId === "object" ? s.teamId?._id : s.teamId;
      return groupTeams.some((t) => {
        const tId = typeof t === "object" ? t?._id : t;
        return tId === sTeamId;
      });
    });

    if (apiStandings.length > 0) {
      return apiStandings
        .map((s) => {
          const teamObj = groupTeams.find((t) => {
            const tId = typeof t === "object" ? t?._id : t;
            const sTeamId = typeof s.teamId === "object" ? s.teamId?._id : s.teamId;
            return tId === sTeamId;
          });
          return {
            ...s,
            teamObj: typeof s.teamId === "object" ? s.teamId : teamObj,
          };
        })
        .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
    }

    // Dynamic calculation from matches prop (round <= 5)
    const computed = groupTeams.map((team) => {
      const teamId = typeof team === "object" ? team?._id : team;
      const teamObj = typeof team === "object" ? team : teams.find((t) => t._id === teamId);

      let matchesPlayed = 0;
      let won = 0;
      let drawn = 0;
      let lost = 0;
      let goalsFor = 0;
      let goalsAgainst = 0;

      matches.forEach((m) => {
        const tId = typeof m.tournamentId === "object" ? m.tournamentId?._id : m.tournamentId;
        if (tId !== selectedTournament._id) return;
        if (m.round >= 6) return; // skip knockout matches
        if (m.status !== "FINISHED") return;

        const homeId = typeof m.homeTeam === "object" ? m.homeTeam?._id : m.homeTeam;
        const awayId = typeof m.awayTeam === "object" ? m.awayTeam?._id : m.awayTeam;

        if (homeId === teamId) {
          matchesPlayed++;
          goalsFor += m.homeScore;
          goalsAgainst += m.awayScore;
          if (m.homeScore > m.awayScore) won++;
          else if (m.homeScore < m.awayScore) lost++;
          else drawn++;
        } else if (awayId === teamId) {
          matchesPlayed++;
          goalsFor += m.awayScore;
          goalsAgainst += m.homeScore;
          if (m.awayScore > m.homeScore) won++;
          else if (m.awayScore < m.homeScore) lost++;
          else drawn++;
        }
      });

      const goalDifference = goalsFor - goalsAgainst;
      const points = won * 3 + drawn * 1;

      return {
        teamId,
        teamObj,
        matchesPlayed,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points,
      };
    });

    return computed.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
  };

  // Helper to extract matches score
  const getMatchScore = (match, t1Id, t2Id) => {
    if (!match) return { t1: null, t2: null, display: "- : -" };
    const homeId = typeof match.homeTeam === "object" ? match.homeTeam?._id : match.homeTeam;
    const awayId = typeof match.awayTeam === "object" ? match.awayTeam?._id : match.awayTeam;
    if (homeId === t1Id && awayId === t2Id) {
      return { t1: match.homeScore, t2: match.awayScore, display: `${match.homeScore} - ${match.awayScore}` };
    } else if (homeId === t2Id && awayId === t1Id) {
      return { t1: match.awayScore, t2: match.homeScore, display: `${match.awayScore} - ${match.homeScore}` };
    }
    return { t1: null, t2: null, display: "- : -" };
  };

  // Render a single knockout node in the bracket diagram
  const renderKnockoutCard = (stage) => {
    const resolvedTeamA = stage.teamA || stage.projectedA;
    const resolvedTeamB = stage.teamB || stage.projectedB;

    const nameA = resolvedTeamA?.name || stage.placeholderA;
    const shortNameA = resolvedTeamA?.shortName || stage.placeholderA;
    const logoA = resolvedTeamA?.logo;

    const nameB = resolvedTeamB?.name || stage.placeholderB;
    const shortNameB = resolvedTeamB?.shortName || stage.placeholderB;
    const logoB = resolvedTeamB?.logo;

    const t1Id = resolvedTeamA?._id;
    const t2Id = resolvedTeamB?._id;

    const leg1Score = getMatchScore(stage.leg1, t1Id, t2Id);
    const leg2Score = getMatchScore(stage.leg2, t1Id, t2Id);

    const hasLeg1 = stage.leg1 !== null;
    const hasLeg2 = !!stage.hasLeg2;

    const scoreA1 = leg1Score.t1;
    const scoreB1 = leg1Score.t2;
    const scoreA2 = leg2Score.t1;
    const scoreB2 = leg2Score.t2;

    const isPlayed1 = stage.leg1 && (stage.leg1.status === "FINISHED" || stage.leg1.status === "LIVE" || stage.leg1.status === "ONGOING");
    const isPlayed2 = stage.leg2 && (stage.leg2.status === "FINISHED" || stage.leg2.status === "LIVE" || stage.leg2.status === "ONGOING");

    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow duration-200 relative overflow-hidden">
        {/* Subtle decorative accent */}
        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-400"></div>

        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5 border-b border-gray-100 pb-2 flex justify-between items-center">
          <span>{stage.title}</span>
          {((stage.leg1?.status === "LIVE" || stage.leg2?.status === "LIVE")) && (
            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-extrabold animate-pulse flex items-center gap-1 border border-red-100">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> TRỰC TIẾP •{" "}
              {stage.leg1?.status === "LIVE" ? (
                <LiveClock match={stage.leg1} showIcon={false} />
              ) : (
                <LiveClock match={stage.leg2} showIcon={false} />
              )}
            </span>
          )}
        </div>

        <div className="space-y-4">
          {/* Team A Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {logoA ? (
                <img src={logoA} alt={nameA} className="w-8 h-8 rounded-lg object-cover bg-slate-50 border border-gray-100 shadow-xs" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-xs font-semibold text-slate-400 border border-dashed border-gray-200 shadow-xs">
                  ?
                </div>
              )}
              <div>
                <div className="font-bold text-slate-800 text-sm" title={nameA}>
                  {shortNameA}
                </div>
                {resolvedTeamA && !stage.teamA && (
                  <div className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> Dự kiến
                  </div>
                )}
              </div>
            </div>
            {hasLeg2 ? (
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700">
                <span className="bg-slate-50 text-slate-500 px-2 py-1 rounded-md min-w-[28px] text-center border border-slate-150" title="Lượt đi">
                  {isPlayed1 && scoreA1 !== null ? scoreA1 : "-"}
                </span>
                <span className="bg-slate-50 text-slate-500 px-2 py-1 rounded-md min-w-[28px] text-center border border-slate-150" title="Lượt về">
                  {isPlayed2 && scoreA2 !== null ? scoreA2 : "-"}
                </span>
                <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md min-w-[32px] text-center border border-emerald-100 font-black" title="Tổng tỉ số">
                  {(isPlayed1 || isPlayed2) ? (scoreA1 !== null ? scoreA1 : 0) + (scoreA2 !== null ? scoreA2 : 0) : "-"}
                </span>
              </div>
            ) : (
              <div className="flex items-center text-xs font-mono font-bold text-slate-700">
                <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md min-w-[32px] text-center border border-emerald-100">
                  {isPlayed1 && scoreA1 !== null ? scoreA1 : "-"}
                </span>
              </div>
            )}
          </div>

          {/* Team B Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {logoB ? (
                <img src={logoB} alt={nameB} className="w-8 h-8 rounded-lg object-cover bg-slate-50 border border-gray-100 shadow-xs" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-xs font-semibold text-slate-400 border border-dashed border-gray-200 shadow-xs">
                  ?
                </div>
              )}
              <div>
                <div className="font-bold text-slate-800 text-sm" title={nameB}>
                  {shortNameB}
                </div>
                {resolvedTeamB && !stage.teamB && (
                  <div className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> Dự kiến
                  </div>
                )}
              </div>
            </div>
            {hasLeg2 ? (
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700">
                <span className="bg-slate-50 text-slate-500 px-2 py-1 rounded-md min-w-[28px] text-center border border-slate-150" title="Lượt đi">
                  {isPlayed1 && scoreB1 !== null ? scoreB1 : "-"}
                </span>
                <span className="bg-slate-50 text-slate-500 px-2 py-1 rounded-md min-w-[28px] text-center border border-slate-150" title="Lượt về">
                  {isPlayed2 && scoreB2 !== null ? scoreB2 : "-"}
                </span>
                <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md min-w-[32px] text-center border border-emerald-100 font-black" title="Tổng tỉ số">
                  {(isPlayed1 || isPlayed2) ? (scoreB1 !== null ? scoreB1 : 0) + (scoreB2 !== null ? scoreB2 : 0) : "-"}
                </span>
              </div>
            ) : (
              <div className="flex items-center text-xs font-mono font-bold text-slate-700">
                <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md min-w-[32px] text-center border border-emerald-100">
                  {isPlayed1 && scoreB1 !== null ? scoreB1 : "-"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Lineup configuration buttons */}
        {isAdmin && (stage.leg1 || stage.leg2) && (
          <div className="flex justify-end gap-2 mt-3.5 pt-3 border-t border-slate-100 text-xs">
            {stage.leg1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenLineupModal(stage.leg1);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 px-2.5 py-1.5 border border-slate-200 hover:border-emerald-200 transition-colors cursor-pointer font-bold animate-fade-in"
              >
                <Users className="w-3.5 h-3.5 text-slate-500" /> Đội hình Lượt đi
              </button>
            )}
            {stage.leg2 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenLineupModal(stage.leg2);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 px-2.5 py-1.5 border border-slate-200 hover:border-emerald-200 transition-colors cursor-pointer font-bold animate-fade-in"
              >
                <Users className="w-3.5 h-3.5 text-slate-500" /> Đội hình Lượt về
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const getPairsForStage = (stageMatches) => {
    const pairsMap = {};
    stageMatches.forEach((m) => {
      const homeId = typeof m.homeTeam === "object" ? m.homeTeam?._id : m.homeTeam;
      const awayId = typeof m.awayTeam === "object" ? m.awayTeam?._id : m.awayTeam;
      if (!homeId || !awayId) return;
      const key = [homeId, awayId].sort().join("-");
      if (!pairsMap[key]) {
        pairsMap[key] = {
          teamA: m.homeTeam,
          teamB: m.awayTeam,
          leg1: null,
          leg2: null,
        };
      }
      const rName = m.roundName?.roundName || "";
      if (rName.includes("Lượt đi")) {
        pairsMap[key].leg1 = m;
      } else if (rName.includes("Lượt về")) {
        pairsMap[key].leg2 = m;
      } else {
        if (!pairsMap[key].leg1) {
          pairsMap[key].leg1 = m;
        } else {
          pairsMap[key].leg2 = m;
        }
      }
    });
    return Object.values(pairsMap);
  };

  // If a specific tournament is selected, render its detail view
  if (selectedTournament) {
    const isCup = selectedTournament.type === "CUP";

    return (
      <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Header section with back button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedTournament(null)}
              className="inline-flex items-center justify-center w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-gray-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                {selectedTournament.name}
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                  {selectedTournament.type}
                </span>
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">Mùa giải: {selectedTournament.season || "2026"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && isCup && (
              <button
                onClick={() => onConfigureKnockoutStages(selectedTournament)}
                className="inline-flex items-center gap-2 bg-[#0c1726] hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
              >
                Cấu hình Knockout
              </button>
            )}
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border ${selectedTournament.status === "COMPLETED"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : selectedTournament.status === "ONGOING"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${selectedTournament.status === "COMPLETED" ? "bg-blue-600" :
                selectedTournament.status === "ONGOING" ? "bg-emerald-600" : "bg-amber-600"
                }`}></span>
              {selectedTournament.status === "COMPLETED" ? "Kết thúc" :
                selectedTournament.status === "ONGOING" ? "Đang diễn ra" : "Chưa bắt đầu"}
            </span>
          </div>
        </div>

        {/* Tab View Selector for CUP */}
        {isCup ? (
          <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-md border border-slate-200/50">
            <button
              onClick={() => setDetailTab("groups")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${detailTab === "groups"
                ? "bg-white text-emerald-800 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Vòng bảng (Groups)
            </button>
            <button
              onClick={() => setDetailTab("knockout")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${detailTab === "knockout"
                ? "bg-white text-emerald-800 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Vòng loại trực tiếp (Knockout)
            </button>
          </div>
        ) : null}

        {loadingStandings ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-20 text-center flex flex-col items-center justify-center gap-3">
            <Spin size="large" />
            <span className="text-slate-500 font-semibold text-sm">Đang đồng bộ dữ liệu bảng đấu...</span>
          </div>
        ) : (
          <div>
            {/* 1. Group Standings View */}
            {detailTab === "groups" && (
              <div className="space-y-8">
                {isCup ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Render Group A and Group B side by side */}
                    {selectedTournament.groups?.map((group) => {
                      const groupStandings = getStandingsForGroup(group.name, group.teams);
                      return (
                        <div key={group._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                          <h3 className="text-lg font-bold text-slate-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                            <Shield className="w-5.5 h-5.5 text-emerald-600" />
                            {group.name}
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 border-collapse">
                              <thead>
                                <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase">
                                  <th className="py-3 px-2 w-10 text-center">Hạng</th>
                                  <th className="py-3 px-2">Đội bóng</th>
                                  <th className="py-3 px-2 text-center w-12">Trận</th>
                                  <th className="py-3 px-2 text-center w-10">T</th>
                                  <th className="py-3 px-2 text-center w-10">H</th>
                                  <th className="py-3 px-2 text-center w-10">B</th>
                                  <th className="py-3 px-2 text-center w-12">HS</th>
                                  <th className="py-3 px-2 text-center w-12 font-bold text-slate-800">Điểm</th>
                                </tr>
                              </thead>
                              <tbody>
                                {groupStandings.map((row, idx) => {
                                  const isTop2 = idx < 2;
                                  const tName = row.teamObj?.name || "Đội bóng";
                                  const tShortName = row.teamObj?.shortName || "CLB";
                                  const tLogo = row.teamObj?.logo;

                                  return (
                                    <tr
                                      key={row.teamId}
                                      className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${isTop2 ? "bg-emerald-50/20 font-medium" : ""
                                        }`}
                                    >
                                      <td className="py-3.5 px-2 text-center font-bold">
                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${idx === 0 ? "bg-emerald-500 text-white shadow-xs" :
                                          idx === 1 ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                                            "text-slate-400"
                                          }`}>
                                          {idx + 1}
                                        </span>
                                      </td>
                                      <td className="py-3.5 px-2 flex items-center gap-2.5">
                                        {tLogo ? (
                                          <img src={tLogo} alt={tShortName} className="w-6.5 h-6.5 rounded-md object-cover bg-slate-50 border border-gray-100 shadow-xs" />
                                        ) : (
                                          <div className="w-6.5 h-6.5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-gray-200">
                                            CL
                                          </div>
                                        )}
                                        <div>
                                          <span className="font-extrabold text-slate-900 block leading-tight">{tShortName}</span>
                                          <span className="text-[10px] text-slate-400 font-medium">{tName}</span>
                                        </div>
                                      </td>
                                      <td className="py-3.5 px-2 text-center font-mono font-bold text-slate-700">{row.matchesPlayed}</td>
                                      <td className="py-3.5 px-2 text-center font-mono text-slate-600">{row.won}</td>
                                      <td className="py-3.5 px-2 text-center font-mono text-slate-600">{row.drawn}</td>
                                      <td className="py-3.5 px-2 text-center font-mono text-slate-600">{row.lost}</td>
                                      <td className={`py-3.5 px-2 text-center font-mono font-bold ${row.goalDifference > 0 ? "text-emerald-600" : row.goalDifference < 0 ? "text-red-500" : "text-slate-400"
                                        }`}>
                                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                      </td>
                                      <td className="py-3.5 px-2 text-center font-mono font-black text-emerald-700">{row.points}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          {groupStandings.length > 0 && (
                            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50">
                              <Sparkles className="w-3.5 h-3.5" /> Top 2 đội dẫn đầu sẽ giành vé bước tiếp vào Vòng Bán kết Knockout.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // General League Standings Table
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                      <Trophy className="w-5.5 h-5.5 text-emerald-600" />
                      Bảng xếp hạng tổng thể
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-600 border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase">
                            <th className="py-3 px-2 w-10 text-center">Hạng</th>
                            <th className="py-3 px-2">Đội bóng</th>
                            <th className="py-3 px-2 text-center w-12">Trận</th>
                            <th className="py-3 px-2 text-center w-10">T</th>
                            <th className="py-3 px-2 text-center w-10">H</th>
                            <th className="py-3 px-2 text-center w-10">B</th>
                            <th className="py-3 px-2 text-center w-12">HS</th>
                            <th className="py-3 px-2 text-center w-12 font-bold text-slate-800">Điểm</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getStandingsForGroup("Bảng xếp hạng", teams).map((row, idx) => {
                            const tName = row.teamObj?.name || "Đội bóng";
                            const tShortName = row.teamObj?.shortName || "CLB";
                            const tLogo = row.teamObj?.logo;

                            return (
                              <tr key={row.teamId} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <td className="py-3.5 px-2 text-center font-bold">
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${idx === 0 ? "bg-amber-500 text-white" :
                                    idx === 1 ? "bg-slate-300 text-slate-800" :
                                      idx === 2 ? "bg-amber-600 text-white" : "text-slate-400"
                                    }`}>
                                    {idx + 1}
                                  </span>
                                </td>
                                <td className="py-3.5 px-2 flex items-center gap-2.5">
                                  {tLogo ? (
                                    <img src={tLogo} alt={tShortName} className="w-6.5 h-6.5 rounded-md object-cover bg-slate-50 border border-gray-100 shadow-xs" />
                                  ) : (
                                    <div className="w-6.5 h-6.5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-gray-200">
                                      CL
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-extrabold text-slate-900 block leading-tight">{tShortName}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">{tName}</span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-2 text-center font-mono font-bold text-slate-700">{row.matchesPlayed}</td>
                                <td className="py-3.5 px-2 text-center font-mono text-slate-600">{row.won}</td>
                                <td className="py-3.5 px-2 text-center font-mono text-slate-600">{row.drawn}</td>
                                <td className="py-3.5 px-2 text-center font-mono text-slate-600">{row.lost}</td>
                                <td className={`py-3.5 px-2 text-center font-mono font-bold ${row.goalDifference > 0 ? "text-emerald-600" : row.goalDifference < 0 ? "text-red-500" : "text-slate-400"
                                  }`}>
                                  {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                </td>
                                <td className="py-3.5 px-2 text-center font-mono font-black text-emerald-700">{row.points}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Knockout Bracket View */}
            {detailTab === "knockout" && (
              <div className="bg-slate-50/50 rounded-2xl border border-gray-200 p-8 space-y-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-gray-200/60 pb-3">
                  <Trophy className="w-5.5 h-5.5 text-amber-500" />
                  <h3 className="text-lg font-bold text-slate-900">Sơ đồ thi đấu vòng loại trực tiếp (Knockout Bracket)</h3>
                </div>

                {loadingStages ? (
                  <div className="text-center py-20 flex flex-col items-center justify-center gap-3">
                    <Spin size="large" />
                    <span className="text-slate-500 font-semibold text-sm">Đang tải sơ đồ thi đấu...</span>
                  </div>
                ) : knockoutStagesList.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 font-medium text-sm border border-dashed border-slate-200 rounded-3xl bg-white flex flex-col items-center justify-center gap-2">
                    <Trophy className="w-10 h-10 text-slate-350" />
                    <span>Chưa có cấu hình vòng loại trực tiếp cho giải đấu này.</span>
                  </div>
                ) : (
                  (() => {
                    const maxMatches = Math.pow(2, knockoutStagesList.length - 1);
                    const totalHeight = Math.max(560, maxMatches * 200);

                    // Helper to check if a matchup has finished
                    const isMatchupFinished = (m) => {
                      if (!m) return false;
                      if (m.leg2) return m.leg2.status === "FINISHED";
                      return m.leg1 && m.leg1.status === "FINISHED";
                    };

                    // Helper to check if previous round feeder matchups are finished
                    const isFeederFinished = (stageIdx, matchIdx) => {
                      if (stageIdx <= 0) return false;
                      const prevStage = knockoutStagesList[stageIdx - 1];
                      const prevMatches = matches.filter((m) => {
                        const mTourId = typeof m.tournamentId === "object" ? m.tournamentId?._id : m.tournamentId;
                        const mStageId = m.roundName?.knockoutStageId || m.roundName;
                        const targetStageId = typeof mStageId === "object" ? mStageId?._id || mStageId?.knockoutStageId : mStageId;
                        return mTourId === selectedTournament._id && String(targetStageId) === String(prevStage._id);
                      });
                      const prevPairs = getPairsForStage(prevMatches);
                      const feed1 = prevPairs[2 * matchIdx];
                      const feed2 = prevPairs[2 * matchIdx + 1];
                      return isMatchupFinished(feed1) || isMatchupFinished(feed2);
                    };

                    return (
                      <div className="flex flex-row overflow-x-auto gap-12 pt-4 pb-4 scrollbar-thin scrollbar-thumb-slate-200 items-stretch w-full" style={{ minHeight: `${totalHeight + 100}px` }}>
                        {knockoutStagesList.map((stage, sIdx) => {
                          const stageMatches = matches.filter((m) => {
                            const mTourId = typeof m.tournamentId === "object" ? m.tournamentId?._id : m.tournamentId;
                            const mStageId = m.roundName?.knockoutStageId || m.roundName;
                            const targetStageId = typeof mStageId === "object" ? mStageId?._id || mStageId?.knockoutStageId : mStageId;
                            return mTourId === selectedTournament._id && String(targetStageId) === String(stage._id);
                          });

                          const pairs = getPairsForStage(stageMatches);
                          const isLastStage = sIdx === knockoutStagesList.length - 1;

                          // Calculate expected matches based on distance to the final stage to dynamically draw full tree
                          const expectedMatches = Math.pow(2, knockoutStagesList.length - 1 - sIdx);
                          const stagePairs = Array.from({ length: expectedMatches }, (_, idx) => {
                            return pairs[idx] || { teamA: null, teamB: null, leg1: null, leg2: null };
                          });

                          // Group into pairs for drawing connectors (all stages except the last)
                          const groupedPairs = [];
                          if (!isLastStage) {
                            for (let i = 0; i < stagePairs.length; i += 2) {
                              groupedPairs.push({
                                matchupA: stagePairs[i],
                                matchupB: stagePairs[i + 1] || null
                              });
                            }
                          }

                          const colWidth = 280;

                          return (
                            <div key={stage._id} className="flex flex-col shrink-0" style={{ width: `${colWidth}px` }}>
                              {/* Column Header */}
                              <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 flex items-center gap-1.5 shrink-0">
                                <Trophy className="w-4 h-4 text-emerald-600 animate-bounce" />
                                {stage.name}
                              </div>

                              {/* Matchups Column */}
                              <div className="flex-1 flex flex-col justify-around relative animate-fade-in" style={{ height: `${totalHeight}px` }}>
                                {isLastStage ? (
                                  (() => {
                                    const isPrevFinished = isFeederFinished(sIdx, 0);
                                    return (
                                      <div className="relative flex items-center justify-center h-full pr-12 w-full">
                                        <div className="w-[240px] z-10">
                                          {renderKnockoutCard({
                                            title: stage.name,
                                            teamA: stagePairs[0].teamA,
                                            teamB: stagePairs[0].teamB,
                                            leg1: stagePairs[0].leg1,
                                            leg2: stagePairs[0].leg2,
                                            hasLeg2: stage.hasLeg2,
                                            placeholderA: `Đội tuyển A`,
                                            placeholderB: `Đội tuyển B`,
                                          })}
                                        </div>
                                        {/* Left receiver */}
                                        {sIdx > 0 && (
                                          <div className={`absolute left-[-24px] top-1/2 -translate-y-1/2 w-[24px] h-[2px] pointer-events-none transition-colors duration-300 ${isPrevFinished ? "bg-emerald-500 z-20" : "bg-slate-350"}`}></div>
                                        )}
                                      </div>
                                    );
                                  })()
                                ) : (
                                  groupedPairs.map((gp, gpIdx) => {
                                    const pairHeight = totalHeight / groupedPairs.length;
                                    const isAFinished = isMatchupFinished(gp.matchupA);
                                    const isBFinished = isMatchupFinished(gp.matchupB);
                                    const isPrevAFinished = isFeederFinished(sIdx, gpIdx * 2);
                                    const isPrevBFinished = isFeederFinished(sIdx, gpIdx * 2 + 1);

                                    return (
                                      <div
                                        key={gpIdx}
                                        className="relative flex flex-col justify-between py-4 w-full"
                                        style={{ height: `${pairHeight}px` }}
                                      >
                                        <div className="relative flex items-center pr-12 h-1/2 w-full">
                                          <div className="w-[240px] z-10">
                                            {renderKnockoutCard({
                                              title: `${stage.name} - Cặp ${gpIdx * 2 + 1}`,
                                              teamA: gp.matchupA.teamA,
                                              teamB: gp.matchupA.teamB,
                                              leg1: gp.matchupA.leg1,
                                              leg2: gp.matchupA.leg2,
                                              hasLeg2: stage.hasLeg2,
                                              placeholderA: `Đội tuyển A`,
                                              placeholderB: `Đội tuyển B`,
                                            })}
                                          </div>
                                          {/* Left receiver */}
                                          {sIdx > 0 && (
                                            <div className={`absolute left-[-24px] top-1/2 -translate-y-1/2 w-[24px] h-[2px] pointer-events-none transition-colors duration-300 ${isPrevAFinished ? "bg-emerald-500 z-20" : "bg-slate-350"}`}></div>
                                          )}
                                        </div>

                                        {/* Matchup B Container */}
                                        {gp.matchupB ? (
                                          <div className="relative flex items-center pr-12 h-1/2 w-full">
                                            <div className="w-[240px] z-10">
                                              {renderKnockoutCard({
                                                title: `${stage.name} - Cặp ${gpIdx * 2 + 2}`,
                                                teamA: gp.matchupB.teamA,
                                                teamB: gp.matchupB.teamB,
                                                leg1: gp.matchupB.leg1,
                                                leg2: gp.matchupB.leg2,
                                                hasLeg2: stage.hasLeg2,
                                                placeholderA: `Đội tuyển A`,
                                                placeholderB: `Đội tuyển B`,
                                              })}
                                            </div>
                                            {/* Left receiver */}
                                            {sIdx > 0 && (
                                              <div className={`absolute left-[-24px] top-1/2 -translate-y-1/2 w-[24px] h-[2px] pointer-events-none transition-colors duration-300 ${isPrevBFinished ? "bg-emerald-500 z-20" : "bg-slate-350"}`}></div>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="h-1/2 invisible" />
                                        )}

                                        {/* Upper matchup rounded connector elbow (top-right) */}
                                        {gp.matchupB && (
                                          <div className={`absolute right-6 top-1/4 w-6 h-1/4 border-r-2 border-t-2 rounded-tr-xl pointer-events-none transition-colors duration-300 ${isAFinished ? "border-emerald-500 z-20" : "border-slate-300"}`}></div>
                                        )}

                                        {/* Lower matchup rounded connector elbow (bottom-right) */}
                                        {gp.matchupB && (
                                          <div className={`absolute right-6 top-1/2 w-6 h-1/4 border-r-2 border-b-2 rounded-br-xl pointer-events-none transition-colors duration-300 ${isBFinished ? "border-emerald-500 z-20" : "border-slate-300"}`}></div>
                                        )}

                                        {/* Central horizontal bridge line extending right */}
                                        {gp.matchupB && (
                                          <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-6 h-[2px] pointer-events-none transition-colors duration-300 ${(isAFinished || isBFinished) ? "bg-emerald-500 z-20" : "bg-slate-350"}`}></div>
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                )
              }
            </div>
          )}
        </div>
      )}
      </main>
    );
  }

  // Original list of tournaments
  return (
    <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
      <PageHeader
        title="Danh sách giải đấu"
        description="Quản lý các giải đấu đang hoạt động và theo dõi thông tin chi tiết từng giải."
        action={
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={onAddTournament}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl border border-emerald-600 text-xs shadow-xs transition-colors cursor-pointer"
              >
                Thêm giải đấu
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-gray-200 bg-white p-20 text-center flex flex-col items-center justify-center gap-3">
            <Spin size="large" />
            <span className="text-slate-500 font-semibold text-sm">Đang tải danh sách giải đấu...</span>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8 text-slate-300" />
            <span className="text-sm font-semibold">Chưa có giải đấu nào trong cơ sở dữ liệu.</span>
          </div>
        ) : (
          tournaments.map((tournament) => (
            <div
              key={tournament._id}
              onClick={() => setSelectedTournament(tournament)}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {tournament.name}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Mùa giải {tournament.season || "2026"}</p>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {isAdmin && (
                    <button
                      onClick={() => onEditTournament(tournament)}
                      className="p-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-705 text-slate-500 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all"
                      title="Chỉnh sửa giải đấu"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase border ${tournament.status === "COMPLETED" ? "bg-blue-50 text-blue-700 border-blue-100" :
                    tournament.status === "ONGOING" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      "bg-amber-50 text-amber-700 border-amber-100"
                    }`}>
                    {tournament.status === "COMPLETED" ? "Kết thúc" :
                      tournament.status === "ONGOING" ? "Đang diễn ra" : "Chưa bắt đầu"}
                  </span>
                </div>
              </div>

              <div className="mt-5 text-sm text-slate-600 space-y-2 border-t border-slate-50 pt-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Thể thức thi đấu:</span>
                  <span className="font-extrabold text-emerald-800 bg-emerald-50/50 border border-emerald-100/50 px-2 py-0.5 rounded text-[10px]">
                    {tournament.type || "CUP"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Tổng trận đấu đã xếp:</span>
                  <span className="font-bold text-slate-700">
                    {matches.filter((match) => {
                      const tournamentId = typeof match.tournamentId === "object" ? match.tournamentId?._id : match.tournamentId;
                      return tournamentId === tournament._id;
                    }).length} trận
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Tổng số đội tuyển:</span>
                  <span className="font-bold text-slate-700">
                    {tournament.type === "CUP"
                      ? (tournament.groups?.reduce((acc, g) => acc + (g.teams?.length || 0), 0) || teams.length)
                      : teams.length} đội
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <MatchLineupModal
        visible={isLineupModalOpen}
        onClose={() => setIsLineupModalOpen(false)}
        match={selectedLineupMatch}
        players={players}
      />
    </main>
  );
};

export default LeaguesView;
