import React, { useState } from "react";
import { Drawer, Tag, Button, Form, Select, InputNumber, Input, message } from "antd";
import { Radio, Trophy, Zap } from "lucide-react";
import { triggerMatchEvent } from "../api";

const { Option } = Select;

const LiveControlDrawer = ({ visible, onClose, match, onEventTriggered }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  if (!match) return null;

  const homeName = match.homeTeam?.name || match.homeTeam?.shortName || "Đội nhà";
  const awayName = match.awayTeam?.name || match.awayTeam?.shortName || "Đội khách";

  const handleSendEvent = async (values) => {
    try {
      setLoading(true);
      const eventData = {
        type: values.eventType,
        minute: values.minute,
        player: values.player || "Cầu thủ",
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

        <div className="flex items-center justify-around my-4">
          <div className="text-center w-1/3">
            <div className="text-lg font-bold truncate">{homeName}</div>
            <div className="text-[11px] text-slate-400">Đội nhà</div>
          </div>

          <div className="text-3xl font-black text-emerald-400 font-mono tracking-widest px-4 py-2 bg-slate-800/80 rounded-xl border border-slate-700">
            {match.homeScore ?? 0} - {match.awayScore ?? 0}
          </div>

          <div className="text-center w-1/3">
            <div className="text-lg font-bold truncate">{awayName}</div>
            <div className="text-[11px] text-slate-400">Đội khách</div>
          </div>
        </div>

        <div className="text-xs text-rose-400 font-semibold flex items-center justify-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
          Phút thi đấu: {match.status === "LIVE" ? "Đang diễn ra" : match.status}
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
        initialValues={{
          eventType: "Goal",
          team: "home",
          minute: 45,
        }}
      >
        <Form.Item name="eventType" label="Loại sự kiện" rules={[{ required: true }]}>
          <Select size="large">
            <Option value="Goal">⚽ Bàn thắng (Goal)</Option>
            <Option value="YellowCard">🟨 Thẻ vàng (Yellow Card)</Option>
            <Option value="RedCard">🟥 Thẻ đỏ (Red Card)</Option>
            <Option value="Substitution">🔄 Thay người (Substitution)</Option>
            <Option value="OwnGoal">⚠️ Phản lưới nhà (Own Goal)</Option>
          </Select>
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="team" label="Đội thực hiện" rules={[{ required: true }]}>
            <Select size="large">
              <Option value="home">{homeName} (Đội nhà)</Option>
              <Option value="away">{awayName} (Đội khách)</Option>
            </Select>
          </Form.Item>

          <Form.Item name="minute" label="Phút thi đấu" rules={[{ required: true }]}>
            <InputNumber min={1} max={120} className="w-full" size="large" />
          </Form.Item>
        </div>

        <Form.Item name="player" label="Tên cầu thủ">
          <Input placeholder="Nhập tên cầu thủ (VD: Nguyen Van A)..." size="large" />
        </Form.Item>

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
