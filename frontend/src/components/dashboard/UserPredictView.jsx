import React, { useState } from "react";
import { message, Modal, InputNumber, Select, Checkbox, Statistic } from "antd";
import { Sparkles, Trophy, Calendar, Edit3, Award } from "lucide-react";
import { submitPrediction, fetchMyPredictions } from "../../api";

const UserPredictView = ({
  predictionMatches = [],
  myPredictions = [],
  allPlayers = [],
  token = "",
  setMyPredictions,
  loadData
}) => {
  const [isPredictionModalOpen, setIsPredictionModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [predictScores, setPredictScores] = useState({ home: 0, away: 0 });
  const [selectedScorer, setSelectedScorer] = useState(null);
  const [useX2Boost, setUseX2Boost] = useState(false);
  const [submittingPrediction, setSubmittingPrediction] = useState(false);

  const getTeamName = (team) => {
    if (!team) return "—";
    return typeof team === "object" ? team.name || team.shortName : team;
  };

  const getTeamLogo = (team) => {
    if (team && typeof team === "object" && team.logo) return team.logo;
    return null;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa xác định";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Chưa xác định";
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const openPredictionModal = (match, existingPrediction) => {
    setSelectedMatch(match);
    setPredictScores({
      home: existingPrediction ? existingPrediction.predictedHomeScore : 0,
      away: existingPrediction ? existingPrediction.predictedAwayScore : 0
    });
    setSelectedScorer(existingPrediction ? existingPrediction.firstScorePlayer : null);
    setUseX2Boost(existingPrediction ? existingPrediction.x2Bonus : false);
    setIsPredictionModalOpen(true);
  };

  const handlePredictionSubmit = async () => {
    if (!selectedMatch) return;
    try {
      setSubmittingPrediction(true);
      const payload = {
        matchId: selectedMatch._id || selectedMatch.id,
        homeScore: predictScores.home,
        awayScore: predictScores.away,
        x2Bonus: useX2Boost,
        firstScorePlayer: selectedScorer
      };
      await submitPrediction(payload, token);
      message.success("Lưu dự đoán tỷ số thành công!");
      
      // Reload predictions
      const predictions = await fetchMyPredictions(token);
      setMyPredictions(Array.isArray(predictions) ? predictions : []);
      
      setIsPredictionModalOpen(false);
      setSelectedMatch(null);
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi gửi dự đoán!");
    } finally {
      setSubmittingPrediction(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs">
        <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Award className="w-5.5 h-5.5 text-emerald-600" />
              Dự đoán tỷ số trận đấu sắp diễn ra
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Dự đoán đúng tỷ số nhận ngay 3 điểm, đúng kết quả thắng/hòa nhận 1 điểm tích lũy.</p>
          </div>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Làm mới
          </button>
        </div>

        {/* List of upcoming matches for prediction (Responsive Grid layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {predictionMatches.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 font-medium text-xs">
              Hiện tại không có trận đấu nào để hiển thị.
            </div>
          ) : (
            predictionMatches.map((match) => {
              const existingPred = myPredictions.find(p => String(p.matchId) === String(match._id || match.id));
              const tName = typeof match.tournamentId === "object" ? match.tournamentId?.name : "ASEAN Hyundai Cup";
              
              const matchTimeMs = new Date(match.matchTime || match.date).getTime();
              const isUpcoming = matchTimeMs > Date.now();

              return (
                <div
                  key={match._id || match.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-emerald-250 transition-all duration-305 flex flex-col h-full"
                >
                  {/* Card Header (Dark Theme) */}
                  <div className="bg-slate-900 text-white p-4 flex flex-col gap-1.5 relative border-b border-slate-805">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 uppercase tracking-wider truncate max-w-[150px]">
                        Vòng {match.round} • {tName}
                      </span>
                      
                      {/* Status badge */}
                      {isUpcoming && match.status === "NOT STARTED" ? (
                        <span className="inline-flex items-center gap-1 font-black text-amber-400 text-[9px] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wider">
                          Sắp đấu
                        </span>
                      ) : match.status === "LIVE" ? (
                        <span className="inline-flex items-center gap-1 font-black text-rose-400 text-[9px] bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30 uppercase tracking-wider animate-pulse">
                          LIVE
                        </span>
                      ) : match.status === "FINISHED" ? (
                        <span className="inline-flex items-center gap-1 font-black text-slate-400 text-[9px] bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 uppercase tracking-wider">
                          Hoàn tất
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-black text-amber-500 text-[9px] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wider">
                          Đã khóa
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formatDate(match.matchTime || match.date)}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    {/* Versus Matchup layout */}
                    <div className="flex items-center justify-between gap-3 py-2 bg-slate-50/50 rounded-2xl px-4 border border-slate-100">
                      {/* Home Team */}
                      <div className="flex flex-col items-center gap-1.5 w-[90px] text-center">
                        {getTeamLogo(match.homeTeam) ? (
                          <img src={getTeamLogo(match.homeTeam)} alt="" className="w-10 h-10 rounded-full object-cover bg-white border border-slate-200 shadow-3xs" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">?</div>
                        )}
                        <span className="font-extrabold text-slate-800 text-xs truncate w-full" title={getTeamName(match.homeTeam)}>
                          {typeof match.homeTeam === "object" ? match.homeTeam?.shortName || match.homeTeam?.name : "Đội nhà"}
                        </span>
                      </div>

                      {/* Score / VS */}
                      <div className="flex flex-col items-center">
                        {match.status === "NOT STARTED" ? (
                          <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-slate-400 text-[10px] tracking-wider shadow-3xs">
                            VS
                          </div>
                        ) : (
                          <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl font-mono font-black text-emerald-800 text-base shadow-3xs">
                            {match.homeScore} - {match.awayScore}
                          </div>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="flex flex-col items-center gap-1.5 w-[90px] text-center">
                        {getTeamLogo(match.awayTeam) ? (
                          <img src={getTeamLogo(match.awayTeam)} alt="" className="w-10 h-10 rounded-full object-cover bg-white border border-slate-200 shadow-3xs" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">?</div>
                        )}
                        <span className="font-extrabold text-slate-800 text-xs truncate w-full" title={getTeamName(match.awayTeam)}>
                          {typeof match.awayTeam === "object" ? match.awayTeam?.shortName || match.awayTeam?.name : "Đội khách"}
                        </span>
                      </div>
                    </div>

                    {/* Countdown for Upcoming matches */}
                    {isUpcoming && match.status === "NOT STARTED" && (
                      <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-2 flex items-center justify-between gap-2">
                        <span className="text-[9px] text-amber-700 font-extrabold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-505" />
                          Còn lại
                        </span>
                        <Statistic.Countdown 
                          value={matchTimeMs} 
                          format="D[d] H:m:s" 
                          valueStyle={{ fontSize: '11px', color: '#b45309', fontWeight: '950', fontFamily: 'monospace', lineHeight: 1 }} 
                        />
                      </div>
                    )}

                    {/* Prediction details */}
                    <div className="space-y-2">
                      <div className="text-[9.5px] font-black text-slate-455 uppercase tracking-wider mb-1">Nhận định của bạn</div>
                      
                      {/* Score Prediction Row */}
                      <div className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold ${
                        existingPred 
                          ? (existingPred.x2Bonus ? 'bg-amber-50/30 border-amber-200/80 shadow-3xs' : 'bg-slate-55 border-slate-150')
                          : 'bg-slate-50 border-slate-105 border-dashed text-slate-400'
                      }`}>
                        <span className="font-extrabold text-slate-500">Tỷ số trận đấu</span>
                        {existingPred ? (
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-black text-slate-800 text-sm">
                              {existingPred.predictedHomeScore} - {existingPred.predictedAwayScore}
                            </span>
                            {existingPred.x2Bonus && (
                              <span className="text-[7.5px] font-black bg-amber-400 text-amber-950 px-1 py-0.2 rounded border border-amber-305">X2</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">Chưa dự đoán</span>
                        )}
                      </div>

                      {/* Scorer Prediction Row */}
                      <div className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold ${
                        existingPred && existingPred.firstScorePlayer
                          ? 'bg-slate-55 border-slate-150'
                          : 'bg-slate-50 border-slate-105 border-dashed text-slate-400'
                      }`}>
                        <span className="font-extrabold text-slate-500">Cầu thủ ghi bàn đầu</span>
                        {existingPred && existingPred.firstScorePlayer ? (
                          <span className="font-bold text-slate-800 text-[10px] flex items-center gap-1 max-w-[130px] truncate">
                            ⚽ {(() => {
                              const pl = allPlayers.find(p => String(p._id || p.id) === String(existingPred.firstScorePlayer));
                              return pl ? pl.name : "Cầu thủ";
                            })()}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">Chưa chọn</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer (Dark/Navy) */}
                  <div className="bg-slate-950 text-white px-4 py-3 flex items-center justify-between border-t border-slate-900 mt-auto">
                    {/* Points Earned display */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase">Điểm</span>
                      <span className={`text-[11px] font-black font-mono px-2 py-0.5 rounded ${
                        match.status === "FINISHED"
                          ? ((existingPred?.pointsEarned || 0) > 0 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-450")
                          : "bg-slate-800 text-slate-455"
                      }`}>
                        {match.status === "FINISHED" ? `+${existingPred?.pointsEarned || 0}đ` : "⏳ Chờ"}
                      </span>
                    </div>

                    {/* Prediction Action buttons */}
                    <div>
                      {isUpcoming && match.status === "NOT STARTED" ? (
                        existingPred ? (
                          <button
                            onClick={() => openPredictionModal(match, existingPred)}
                            className="bg-white hover:bg-slate-100 text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-3xs"
                          >
                            Thay đổi
                          </button>
                        ) : (
                          <button
                            onClick={() => openPredictionModal(match, null)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Dự đoán
                          </button>
                        )
                      ) : (
                        <span className="text-[9.5px] text-slate-500 font-black uppercase flex items-center gap-1">
                          🔒 Đã khóa
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Prediction Submission Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span className="font-black text-slate-800 text-sm tracking-tight">Dự đoán tỷ số trận đấu</span>
          </div>
        }
        open={isPredictionModalOpen}
        onOk={handlePredictionSubmit}
        confirmLoading={submittingPrediction}
        onCancel={() => {
          setIsPredictionModalOpen(false);
          setSelectedMatch(null);
        }}
        okText="Gửi dự đoán"
        cancelText="Hủy bỏ"
        centered
        width={420}
      >
        {selectedMatch && (() => {
          const homeTeamId = typeof selectedMatch.homeTeam === "object" ? (selectedMatch.homeTeam._id || selectedMatch.homeTeam.id) : selectedMatch.homeTeam;
          const awayTeamId = typeof selectedMatch.awayTeam === "object" ? (selectedMatch.awayTeam._id || selectedMatch.awayTeam.id) : selectedMatch.awayTeam;

          const matchPlayers = allPlayers.filter(p => {
            const pTeamId = typeof p.currentTeam === "object" ? (p.currentTeam?._id || p.currentTeam?.id) : p.currentTeam;
            return String(pTeamId) === String(homeTeamId) || String(pTeamId) === String(awayTeamId);
          });

          return (
            <div className="my-5">
              <div className="flex items-center justify-between gap-4 py-4 bg-slate-50/60 px-4 border border-slate-150 rounded-2xl">
                {/* Home */}
                <div className="flex flex-col items-center gap-1.5 w-[110px] text-center">
                  {getTeamLogo(selectedMatch.homeTeam) ? (
                    <img src={getTeamLogo(selectedMatch.homeTeam)} alt="" className="w-10 h-10 rounded-full object-cover bg-white border border-slate-100 shadow-2xs" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">?</div>
                  )}
                  <span className="font-extrabold text-slate-800 text-xs truncate w-full" title={getTeamName(selectedMatch.homeTeam)}>
                    {typeof selectedMatch.homeTeam === "object" ? selectedMatch.homeTeam?.shortName || selectedMatch.homeTeam?.name : "Đội nhà"}
                  </span>
                  <InputNumber
                    min={0}
                    max={20}
                    value={predictScores.home}
                    onChange={(val) => setPredictScores(prev => ({ ...prev, home: val || 0 }))}
                    size="large"
                    className="w-16 rounded-xl border-slate-250 font-mono font-bold text-center"
                  />
                </div>

                <div className="font-black text-slate-405 text-sm font-mono">—</div>

                {/* Away */}
                <div className="flex flex-col items-center gap-1.5 w-[110px] text-center">
                  {getTeamLogo(selectedMatch.awayTeam) ? (
                    <img src={getTeamLogo(selectedMatch.awayTeam)} alt="" className="w-10 h-10 rounded-full object-cover bg-white border border-slate-100 shadow-2xs" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">?</div>
                  )}
                  <span className="font-extrabold text-slate-800 text-xs truncate w-full" title={getTeamName(selectedMatch.awayTeam)}>
                    {typeof selectedMatch.awayTeam === "object" ? selectedMatch.awayTeam?.shortName || selectedMatch.awayTeam?.name : "Đội khách"}
                  </span>
                  <InputNumber
                    min={0}
                    max={20}
                    value={predictScores.away}
                    onChange={(val) => setPredictScores(prev => ({ ...prev, away: val || 0 }))}
                    size="large"
                    className="w-16 rounded-xl border-slate-250 font-mono font-bold text-center"
                  />
                </div>
              </div>

              {/* First Goal Scorer Selector */}
              <div className="mt-4">
                <label className="block text-[10px] font-black text-slate-550 uppercase mb-1.5 tracking-wider">
                  ⚽ Cầu thủ ghi bàn đầu tiên
                </label>
                <Select
                  showSearch
                  placeholder="Chọn cầu thủ dự đoán"
                  className="w-full font-semibold"
                  size="large"
                  allowClear
                  value={selectedScorer}
                  onChange={(val) => setSelectedScorer(val)}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={matchPlayers.map(p => ({
                    value: p._id || p.id,
                    label: `${p.jerseyNumber !== undefined ? `#${p.jerseyNumber} ` : ""}${p.name}`
                  }))}
                />
              </div>

              {/* x2 Boost Toggle */}
              <div className="mt-4 bg-emerald-50/70 border border-emerald-150/40 rounded-2xl p-4">
                <Checkbox
                  checked={useX2Boost}
                  onChange={(e) => setUseX2Boost(e.target.checked)}
                  className="font-extrabold text-emerald-800 text-xs flex items-center"
                >
                  ⚡ Boost x2 điểm cho trận này
                </Checkbox>
                <p className="text-[9.5px] text-emerald-600/80 mt-1 pl-6 leading-relaxed font-semibold">
                  Mỗi vòng đấu chỉ được sử dụng duy nhất một lần boost nhân đôi!
                </p>
              </div>

              <div className="text-[10px] text-center text-slate-400 font-semibold mt-4">
                Thời gian đá: {formatDate(selectedMatch.matchTime || selectedMatch.date)}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default UserPredictView;
