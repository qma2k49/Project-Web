import React, { useState, useEffect } from "react";
import PageHeader from "./PageHeader";
import { fetchTeamStandings } from "../../api";
import { Trophy, Calendar, Users, ArrowLeft, Shield, AlertCircle, Sparkles, Pencil } from "lucide-react";
import { Spin } from "antd";
import MatchLineupModal from "./modals/MatchLineupModal";
import LiveClock from "./LiveClock";

const LeaguesView = ({ loading, tournaments, matches, teams, stadiums, players = [], onBack, isAdmin = true, onAddTournament, onEditTournament }) => {
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [standings, setStandings] = useState([]);
  const [loadingStandings, setLoadingStandings] = useState(false);
  const [detailTab, setDetailTab] = useState("groups");

  const [selectedLineupMatch, setSelectedLineupMatch] = useState(null);
  const [isLineupModalOpen, setIsLineupModalOpen] = useState(false);

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
    const hasLeg2 = stage.leg2 !== null;

    const scoreA1 = leg1Score.t1;
    const scoreB1 = leg1Score.t2;
    const scoreA2 = leg2Score.t1;
    const scoreB2 = leg2Score.t2;

    const aggA = (scoreA1 !== null ? scoreA1 : 0) + (scoreA2 !== null ? scoreA2 : 0);
    const aggB = (scoreB1 !== null ? scoreB1 : 0) + (scoreB2 !== null ? scoreB2 : 0);

    const displayAgg = (hasLeg1 || hasLeg2) ? `${aggA} - ${aggB}` : "-";

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
            <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-700">
              <span className="text-slate-400 font-normal" title="Lượt đi">L1: {hasLeg1 ? scoreA1 : "-"}</span>
              <span className="text-slate-400 font-normal" title="Lượt về">L2: {hasLeg2 ? scoreA2 : "-"}</span>
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-black min-w-[32px] text-center">
                {displayAgg}
              </span>
            </div>
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
            <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-700">
              <span className="text-slate-400 font-normal" title="Lượt đi">L1: {hasLeg1 ? scoreB1 : "-"}</span>
              <span className="text-slate-400 font-normal" title="Lượt về">L2: {hasLeg2 ? scoreB2 : "-"}</span>
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-black min-w-[32px] text-center">
                {displayAgg}
              </span>
            </div>
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

  // If a specific tournament is selected, render its detail view
  if (selectedTournament) {
    const isCup = selectedTournament.type === "CUP";
    const knockoutMatches = matches.filter((m) => {
      const tId = typeof m.tournamentId === "object" ? m.tournamentId?._id : m.tournamentId;
      return tId === selectedTournament._id && m.round >= 6 && m.round <= 9;
    });

    // Group A and B top teams from standings
    const groupA = selectedTournament.groups?.[0];
    const groupB = selectedTournament.groups?.[1];

    const groupAStandings = groupA ? getStandingsForGroup(groupA.name, groupA.teams) : [];
    const groupBStandings = groupB ? getStandingsForGroup(groupB.name, groupB.teams) : [];

    const t1A = groupAStandings[0]?.teamObj;
    const t2A = groupAStandings[1]?.teamObj;
    const t1B = groupBStandings[0]?.teamObj;
    const t2B = groupBStandings[1]?.teamObj;

    // Check if group stage is completed (all group matches are FINISHED, round <= 5)
    const groupMatches = matches.filter((m) => {
      const tId = typeof m.tournamentId === "object" ? m.tournamentId?._id : m.tournamentId;
      return tId === selectedTournament._id && m.round <= 5;
    });
    const isGroupStageFinished = groupMatches.length > 0 && groupMatches.every((m) => m.status === "FINISHED");

    // Semi-finals mappings (Round 6 and 7 matches)
    const sfMatches = knockoutMatches.filter((m) => m.round === 6 || m.round === 7);
    const sfPairsMap = {};
    sfMatches.forEach((m) => {
      const homeId = typeof m.homeTeam === "object" ? m.homeTeam?._id : m.homeTeam;
      const awayId = typeof m.awayTeam === "object" ? m.awayTeam?._id : m.awayTeam;
      if (!homeId || !awayId) return;
      const key = [homeId, awayId].sort().join("-");
      if (!sfPairsMap[key]) {
        sfPairsMap[key] = {
          teamA: m.homeTeam,
          teamB: m.awayTeam,
          leg1: null,
          leg2: null,
        };
      }
      if (m.round === 6) sfPairsMap[key].leg1 = m;
      if (m.round === 7) sfPairsMap[key].leg2 = m;
    });
    const sfPairs = Object.values(sfPairsMap);

    let sf1 = {
      title: "Bán kết 1",
      placeholderA: "Nhất Bảng A",
      placeholderB: "Nhì Bảng B",
      projectedA: isGroupStageFinished ? t1A : null,
      projectedB: isGroupStageFinished ? t2B : null,
      teamA: null,
      teamB: null,
      leg1: null,
      leg2: null,
    };

    let sf2 = {
      title: "Bán kết 2",
      placeholderA: "Nhất Bảng B",
      placeholderB: "Nhì Bảng A",
      projectedA: isGroupStageFinished ? t1B : null,
      projectedB: isGroupStageFinished ? t2A : null,
      teamA: null,
      teamB: null,
      leg1: null,
      leg2: null,
    };

    sfPairs.forEach((pair) => {
      const idA = typeof pair.teamA === "object" ? pair.teamA?._id : pair.teamA;
      const idB = typeof pair.teamB === "object" ? pair.teamB?._id : pair.teamB;

      const isSF1 = (t1A && (idA === t1A._id || idB === t1A._id)) || (t2B && (idA === t2B._id || idB === t2B._id));
      const isSF2 = (t1B && (idA === t1B._id || idB === t1B._id)) || (t2A && (idA === t2A._id || idB === t2A._id));

      if (isSF1) {
        sf1.teamA = pair.teamA;
        sf1.teamB = pair.teamB;
        sf1.leg1 = pair.leg1;
        sf1.leg2 = pair.leg2;
      } else if (isSF2) {
        sf2.teamA = pair.teamA;
        sf2.teamB = pair.teamB;
        sf2.leg1 = pair.leg1;
        sf2.leg2 = pair.leg2;
      } else {
        if (!sf1.teamA) {
          sf1.teamA = pair.teamA;
          sf1.teamB = pair.teamB;
          sf1.leg1 = pair.leg1;
          sf1.leg2 = pair.leg2;
        } else if (!sf2.teamA) {
          sf2.teamA = pair.teamA;
          sf2.teamB = pair.teamB;
          sf2.leg1 = pair.leg1;
          sf2.leg2 = pair.leg2;
        }
      }
    });

    // Finals mapping (Round 8 and 9 matches)
    const finalMatches = knockoutMatches.filter((m) => m.round === 8 || m.round === 9);
    let finalPair = {
      title: "Chung kết",
      placeholderA: "Thắng Bán kết 1",
      placeholderB: "Thắng Bán kết 2",
      teamA: null,
      teamB: null,
      leg1: null,
      leg2: null,
    };

    if (finalMatches.length > 0) {
      const firstMatch = finalMatches[0];
      finalPair.teamA = firstMatch.homeTeam;
      finalPair.teamB = firstMatch.awayTeam;
      finalPair.leg1 = finalMatches.find((m) => m.round === 8) || null;
      finalPair.leg2 = finalMatches.find((m) => m.round === 9) || null;
    }

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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
                  {/* Column 1: Semi-Finals */}
                  <div className="lg:col-span-5 space-y-8 flex flex-col justify-center h-full">
                    <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Vòng Bán kết (Lượt đi & Lượt về)
                    </div>
                    {renderKnockoutCard(sf1)}
                    {renderKnockoutCard(sf2)}
                  </div>

                  {/* Column 2: Visual Connectors */}
                  <div className="hidden lg:flex lg:col-span-2 flex-col justify-center items-center h-full space-y-36">
                    <div className="flex items-center w-full justify-between px-4">
                      <div className="h-0.5 bg-slate-200 flex-1"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mx-1"></div>
                      <div className="h-0.5 bg-slate-200 flex-1"></div>
                    </div>
                    <div className="flex items-center w-full justify-between px-4">
                      <div className="h-0.5 bg-slate-200 flex-1"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mx-1"></div>
                      <div className="h-0.5 bg-slate-200 flex-1"></div>
                    </div>
                  </div>

                  {/* Column 3: Finals */}
                  <div className="lg:col-span-5 flex flex-col justify-center h-full space-y-4">
                    <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" /> Chung kết (Lượt đi & Lượt về)
                    </div>
                    {renderKnockoutCard(finalPair)}

                    {/* Vô địch / Champion trophy display */}
                    {(() => {
                      const leg1 = finalPair.leg1;
                      const leg2 = finalPair.leg2;
                      const t1Id = finalPair.teamA?._id;
                      const t2Id = finalPair.teamB?._id;
                      const score1 = getMatchScore(leg1, t1Id, t2Id);
                      const score2 = getMatchScore(leg2, t1Id, t2Id);

                      const isFinished = leg2?.status === "FINISHED";
                      if (isFinished && finalPair.teamA && finalPair.teamB) {
                        const aggA = (score1.t1 || 0) + (score2.t1 || 0);
                        const aggB = (score1.t2 || 0) + (score2.t2 || 0);
                        const winner = aggA > aggB ? finalPair.teamA : aggA < aggB ? finalPair.teamB : null;

                        if (winner) {
                          return (
                            <div className="mt-4 bg-gradient-to-r from-amber-50 to-yellow-100 border border-amber-200 rounded-2xl p-4 flex items-center gap-4.5 shadow-sm">
                              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white shadow shadow-amber-500/25">
                                <Trophy className="w-6.5 h-6.5 stroke-[2]" />
                              </div>
                              <div>
                                <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Đội Vô Địch</h4>
                                <p className="text-lg font-black text-slate-900">{winner.name} ({winner.shortName})</p>
                              </div>
                            </div>
                          );
                        }
                      }
                      return null;
                    })()}
                  </div>
                </div>
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
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-gray-200 text-xs shadow-xs transition-colors cursor-pointer"
            >
              Quay lại
            </button>
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
