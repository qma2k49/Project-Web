import React from "react";
import { Modal, Form, Input, Select, Divider } from "antd";
import { Trophy, Users } from "lucide-react";

const { Option } = Select;

const TournamentModal = ({
  visible,
  onCancel,
  onOk,
  form,
  onFieldChange,
  teams = [],
  editingTournament = null,
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
          <Trophy className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-slate-800 text-base">
            {editingTournament ? "Cập nhật giải đấu" : "Tạo giải đấu mới"}
          </span>
        </div>
      }
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText={editingTournament ? "Lưu lại" : "Tạo giải đấu"}
      cancelText="Hủy"
      centered
      width={520}
    >
      <Form
        layout="vertical"
        className="mt-4"
      >
        <Form.Item label="Tên giải đấu">
          <Input 
            value={form.name} 
            onChange={(e) => onFieldChange("name", e.target.value)} 
            placeholder="Ví dụ: V-League 1, ASEAN Hyundai Cup..." 
            size="large" 
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Mùa giải">
            <Input 
              value={form.season} 
              onChange={(e) => onFieldChange("season", e.target.value)} 
              placeholder="Ví dụ: 2026" 
              size="large" 
            />
          </Form.Item>

          <Form.Item label="Thể thức giải đấu">
            <Select
              size="large"
              value={form.type}
              onChange={(value) => onFieldChange("type", value)}
              disabled={!!editingTournament}
            >
              <Option value="LEAGUE">LEAGUE (Vòng tròn tích điểm)</Option>
              <Option value="CUP">CUP (Chia bảng & Đấu loại trực tiếp)</Option>
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Ngày bắt đầu">
            <Input 
              type="date"
              className="w-full" 
              size="large" 
              value={form.startDate} 
              onChange={(e) => onFieldChange("startDate", e.target.value)}
            />
          </Form.Item>

          <Form.Item label="Ngày kết thúc">
            <Input 
              type="date"
              className="w-full" 
              size="large" 
              value={form.endDate} 
              onChange={(e) => onFieldChange("endDate", e.target.value)}
            />
          </Form.Item>
        </div>

        {form.type === "CUP" && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
            <Divider className="my-1 font-bold text-slate-500 text-xs uppercase tracking-wider">Cấu hình bảng đấu (Cup)</Divider>
            
            <Form.Item
              label={
                <span className="font-semibold text-xs text-slate-700 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" /> Đội tuyển Bảng A
                </span>
              }
            >
              <Select
                mode="multiple"
                placeholder="Chọn các đội bảng A..."
                size="large"
                allowClear
                showSearch
                value={form.groupA || []}
                onChange={(values) => onFieldChange("groupA", values)}
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                options={(teams || []).map(t => ({
                  value: t._id || t.id,
                  label: `${t.name} (${t.shortName || "CLB"})`
                }))}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="font-semibold text-xs text-slate-700 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" /> Đội tuyển Bảng B
                </span>
              }
            >
              <Select
                mode="multiple"
                placeholder="Chọn các đội bảng B..."
                size="large"
                allowClear
                showSearch
                value={form.groupB || []}
                onChange={(values) => onFieldChange("groupB", values)}
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                options={(teams || []).map(t => ({
                  value: t._id || t.id,
                  label: `${t.name} (${t.shortName || "CLB"})`
                }))}
              />
            </Form.Item>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default TournamentModal;
