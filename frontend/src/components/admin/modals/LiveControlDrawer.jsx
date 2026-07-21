import React, { useEffect, useState } from "react";
import { Drawer, Tag, Button, Form, Select, InputNumber, Input, message } from "antd";
import { Radio, Trophy, Zap } from "lucide-react";
import { fetchMatchLineups, fetchPersons, triggerMatchEvent } from "../../../api";

const { Option } = Select;

const LiveControlDrawer = ({ visible, onClose, match, onEventTriggered }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [matchClock, setMatchClock] = useState({ isRunning: false, elapsedSeconds: 0 });
  const [selectedEventType, setSelectedEventType] = useState("Goal");
  const [lineups, setLineups] = useState([]);
  const [players, setPlayers] = useState([]);

  const eventTypeMeta = {
    Goal: {
      label: "Bàn thắng",
      icon: "⚽",
      badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      cardClass: "border-emerald-200 bg-emerald-50/70",
      description: "Ghi nhận bàn thắng của một đội.",
    },
    YellowCard: {
      label: "Thẻ vàng",
      icon: "🟨",
      badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
      cardClass: "border-amber-200 bg-amber-50/70",
      description: "Cảnh báo và thẻ vàng cho cầu thủ.",
    },
    RedCard: {
      label: "Thẻ đỏ",
      icon: "🟥",
      badgeClass: "bg-rose-50 text-rose-700 border border-rose-200",
      cardClass: "border-rose-200 bg-rose-50/70",
      description: "Đá ra sân và xử lý thẻ đỏ.",
    },
    Substitution: {
      label: "Thay người",
      icon: "🔄",
      badgeClass: "bg-sky-50 text-sky-700 border border-sky-200",
      cardClass: "border-sky-200 bg-sky-50/70",
      description: "Ghi nhận pha thay người trong trận.",
    },
    OwnGoal: {
      label: "Phản lưới nhà",
      icon: "⚠️",
      badgeClass: "bg-violet-50 text-violet-700 border border-violet-200",
      cardClass: "border-violet-200 bg-violet-50/70",
      description: "Ghi nhận bàn phản lưới nhà.",
    },
    StartHalf: {
      label: "Bắt đầu hiệp",
      icon: "▶",
      badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      cardClass: "border-emerald-200 bg-emerald-50/70",
      description: "Đánh dấu bắt đầu hiệp 1 hoặc hiệp 2.",
    },
  };

  const activeEventMeta = eventTypeMeta[selectedEventType] || eventTypeMeta.Goal;

  useEffect(() => {
    if (!matchClock.isRunning) return undefined;

    const intervalId = window.setInterval(() => {
      setMatchClock((prev) => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [matchClock.isRunning]);

  useEffect(() => {
    const loadPlayersData = async () => {
      if (!match?._id && !match?.id) return;
      try {
        const [lineupData, personsData] = await Promise.all([
          fetchMatchLineups(match._id || match.id),
          fetchPersons("Player"),
        ]);
        setLineups(Array.isArray(lineupData) ? lineupData : []);
        setPlayers(Array.isArray(personsData) ? personsData : []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu cầu thủ:", error);
      }
    };

    loadPlayersData();
  }, [match]);

  if (!match) return null;

  const homeName = match.homeTeam?.shortName || match.homeTeam?.name || "Đội nhà";
  const awayName = match.awayTeam?.shortName || match.awayTeam?.name || "Đội khách";

  const homeLineup = lineups.find((item) => item.teamId?._id === match.homeTeam?._id || item.teamId?.id === match.homeTeam?._id);
  const awayLineup = lineups.find((item) => item.teamId?._id === match.awayTeam?._id || item.teamId?.id === match.awayTeam?._id);

  const homeStartingPlayers = (homeLineup?.startingXI || []).map((player) => ({
    ...player,
    teamId: match.homeTeam,
  }));
  const awayStartingPlayers = (awayLineup?.startingXI || []).map((player) => ({
    ...player,
    teamId: match.awayTeam,
  }));

  const homeBenchPlayers = (homeLineup?.substitutes || []).map((player) => ({
    ...player,
    teamId: match.homeTeam,
  }));
  const awayBenchPlayers = (awayLineup?.substitutes || []).map((player) => ({
    ...player,
    teamId: match.awayTeam,
  }));

  const onFieldPlayers = [...homeStartingPlayers, ...awayStartingPlayers];
  const benchPlayers = [...homeBenchPlayers, ...awayBenchPlayers];
  const fallbackPlayers = players.filter((player) => player.teamId?._id === match.homeTeam?._id || player.teamId?._id === match.awayTeam?._id || player.teamId === match.homeTeam?._id || player.teamId === match.awayTeam?._id);
  const resolvedOnFieldPlayers = onFieldPlayers.length > 0 ? onFieldPlayers : fallbackPlayers;
  const resolvedBenchPlayers = benchPlayers.length > 0 ? benchPlayers : fallbackPlayers;

  const formatMatchClock = (seconds) => {
    const totalMinutes = Math.floor(seconds / 60);

    if (seconds < 45 * 60) {
      return `${totalMinutes}'`;
    }

    if (seconds < 90 * 60) {
      return `45+${totalMinutes - 45}'`;
    }

    return `90+${totalMinutes - 90}'`;
  };

  const handlePlayerSelect = (value) => {
    const selectedPlayer = resolvedOnFieldPlayers.find((player) => (player._id || player.id) === value);
    if (selectedPlayer) {
      form.setFieldsValue({
        player: selectedPlayer.name || selectedPlayer.fullName || selectedPlayer.username || "Cầu thủ",
      });
    }
  };

  const handleSendEvent = async (values) => {
    try {
      setLoading(true);
      const selectedPlayerId = values.selectedPlayerId || values.outgoingPlayer || values.incomingPlayer || null;
      const selectedPlayer = resolvedOnFieldPlayers.find((player) => (player._id || player.id) === selectedPlayerId) || resolvedBenchPlayers.find((player) => (player._id || player.id) === selectedPlayerId);
      const eventData = {
        type: values.eventType,
        minute: values.minute,
        stoppageMinute: values.stoppageMinute || 0,
        player: values.player || selectedPlayer?.name || selectedPlayer?.fullName || selectedPlayer?.username || "Cầu thủ",
        personId: selectedPlayerId,
        outgoingPlayerId: values.outgoingPlayer || null,
        incomingPlayerId: values.incomingPlayer || null,
        team: values.team,
        note: values.note || "",
      };

      await triggerMatchEvent(match._id || match.id, eventData);
      message.success(`Đã cập nhật sự kiện ${values.eventType} thành công!`);
      form.resetFields();
      onEventTriggered && onEventTriggered();
    } catch (err) {
      message.error("Lỗi gửi sự kiện: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStart = async (half) => {
    try {
      setLoading(true);
      const eventData = {
        type: "StartHalf",
        minute: half === "first" ? 1 : 46,
        stoppageMinute: 0,
        player: "System",
        team: "home",
        note: half === "first" ? "Bắt đầu Hiệp 1" : "Bắt đầu Hiệp 2",
      };

      await triggerMatchEvent(match._id || match.id, eventData);
      setMatchClock({
        isRunning: true,
        elapsedSeconds: half === "first" ? 0 : 45 * 60,
      });
      message.success(half === "first" ? "Đã bắt đầu Hiệp 1" : "Đã bắt đầu Hiệp 2");
      form.resetFields();
      onEventTriggered && onEventTriggered();
    } catch (err) {
      message.error("Lỗi bắt đầu hiệp: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>Bảng điều khiển Live Match Console</span>
          </div>
          <Tag color="red" className="font-bold uppercase tracking-wider">
            LIVE CONTROL
          </Tag>
        </div>
      }
      placement="right"
      width={480}
      onClose={onClose}
      open={visible}
    >
      {/* Score Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md mb-6 relative overflow-hidden text-center">
        <div className="text-[11px] text-emerald-400 uppercase font-bold tracking-widest mb-2 flex items-center justify-center gap-1.5">
          <Trophy className="w-3.5 h-3.5" />
          {match.tournamentId?.name || "V.League 1"} • {match.stadium?.name || "Sân vận động"}
        </div>

        <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3 my-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-800/70 px-3 py-3 text-center">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">Đội nhà</div>
            <div className="text-lg font-bold uppercase tracking-wide truncate">{homeName}</div>
          </div>

          <div className="text-3xl font-black text-emerald-400 font-mono tracking-widest px-4 py-2 bg-slate-800/80 rounded-xl border border-slate-700">
            {match.homeScore ?? 0} - {match.awayScore ?? 0}
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-800/70 px-3 py-3 text-center">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">Đội khách</div>
            <div className="text-lg font-bold uppercase tracking-wide truncate">{awayName}</div>
          </div>
        </div>

        <div className="text-xs text-rose-400 font-semibold flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
          <span>Phút thi đấu: {match.status === "LIVE" ? formatMatchClock(matchClock.elapsedSeconds) : match.status}</span>
        </div>
      </div>

      {/* Quick Start Buttons */}
      <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
        <div className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Bắt đầu hiệp nhanh</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="large"
            type="default"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            onClick={() => handleQuickStart("first")}
            loading={loading}
          >
            ▶ Bắt đầu Hiệp 1
          </Button>
          <Button
            size="large"
            type="default"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            onClick={() => handleQuickStart("second")}
            loading={loading}
          >
            ▶ Bắt đầu Hiệp 2
          </Button>
        </div>
      </div>

      {/* Trigger Event Form */}
      <div className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-amber-500" />
        <span>Ghi nhận sự kiện trận đấu mới</span>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSendEvent}
        onValuesChange={(changedValues) => {
          if (changedValues.eventType) {
            setSelectedEventType(changedValues.eventType);
          }
        }}
        initialValues={{
          eventType: "Goal",
          team: "home",
          minute: 45,
          stoppageMinute: 0,
        }}
      >
        <Form.Item name="eventType" label="Loại sự kiện" rules={[{ required: true }]}>
          <Select size="large">
            <Option value="Goal">
              <span className="inline-flex items-center gap-2">
                <span>⚽</span>
                <span>Bàn thắng</span>
              </span>
            </Option>
            <Option value="YellowCard">
              <span className="inline-flex items-center gap-2">
                <span>🟨</span>
                <span>Thẻ vàng</span>
              </span>
            </Option>
            <Option value="RedCard">
              <span className="inline-flex items-center gap-2">
                <span>🟥</span>
                <span>Thẻ đỏ</span>
              </span>
            </Option>
            <Option value="Substitution">
              <span className="inline-flex items-center gap-2">
                <span>🔄</span>
                <span>Thay người</span>
              </span>
            </Option>
            <Option value="OwnGoal">
              <span className="inline-flex items-center gap-2">
                <span>⚠️</span>
                <span>Phản lưới nhà</span>
              </span>
            </Option>
            <Option value="StartHalf">
              <span className="inline-flex items-center gap-2">
                <span>▶</span>
                <span>Bắt đầu hiệp</span>
              </span>
            </Option>
          </Select>
        </Form.Item>

        <div className={`rounded-2xl border p-3 mb-4 ${activeEventMeta.cardClass}`}>
          <div className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${activeEventMeta.badgeClass}`}>
            <span>{activeEventMeta.icon}</span>
            <span>{activeEventMeta.label}</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{activeEventMeta.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Form.Item name="team" label="Đội thực hiện" rules={[{ required: true }]}> 
            <Select size="large">
              <Option value="home">{homeName} (Đội nhà)</Option>
              <Option value="away">{awayName} (Đội khách)</Option>
            </Select>
          </Form.Item>

          <Form.Item name="minute" label="Phút thi đấu" rules={[{ required: true }]}>
            <InputNumber min={1} max={120} className="w-full" size="large" />
          </Form.Item>

          <Form.Item name="stoppageMinute" label="Phút bù giờ">
            <InputNumber min={0} max={10} className="w-full" size="large" />
          </Form.Item>
        </div>

        {selectedEventType === "Substitution" ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 mb-4">
            <div className="font-semibold text-sm text-slate-800 mb-3">Chọn cầu thủ thay người</div>
            <div className="grid grid-cols-1 gap-3">
              <Form.Item name="outgoingPlayer" label="Cầu thủ rời sân">
                <Select size="large" placeholder="Chọn cầu thủ đang trên sân">
                  {resolvedOnFieldPlayers.map((player) => (
                    <Option key={player._id || player.id} value={player._id || player.id}>
                      {player.name || player.fullName || player.username}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="incomingPlayer" label="Cầu thủ vào sân">
                <Select size="large" placeholder="Chọn cầu thủ từ băng ghế dự bị">
                  {resolvedBenchPlayers.map((player) => (
                    <Option key={player._id || player.id} value={player._id || player.id}>
                      {player.name || player.fullName || player.username}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>
        ) : ["Goal", "YellowCard", "RedCard", "OwnGoal"].includes(selectedEventType) ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 mb-4">
            <div className="font-semibold text-sm text-slate-800 mb-2">Chọn cầu thủ nhanh</div>
            <Form.Item name="selectedPlayerId" label="Cầu thủ liên quan">
              <Select
                size="large"
                placeholder="Chọn cầu thủ từ sân"
                allowClear
                onChange={handlePlayerSelect}
              >
                {resolvedOnFieldPlayers.map((player) => (
                  <Option key={player._id || player.id} value={player._id || player.id}>
                    {player.name || player.fullName || player.username}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="player" label="Tên cầu thủ (tùy chọn)">
              <Input placeholder="Nhập tên cầu thủ nếu cần ghi thủ công..." size="large" />
            </Form.Item>
          </div>
        ) : (
          <Form.Item name="player" label="Tên cầu thủ">
            <Input placeholder="Nhập tên cầu thủ (VD: Nguyen Van A)..." size="large" />
          </Form.Item>
        )}

        <Form.Item name="note" label="Ghi chú sự kiện">
          <Input.TextArea placeholder="Ghi chú thêm (VD: Kiến tạo từ số 10)..." rows={3} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            className="bg-emerald-600 hover:bg-emerald-700 font-bold h-12"
          >
            Gửi sự kiện & Cập nhật CSDL
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default LiveControlDrawer;
