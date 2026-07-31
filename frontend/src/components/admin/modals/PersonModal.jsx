import React from "react";
import { Modal, Form, Input, Select, Upload as AntUpload, Button } from "antd";
import { Link, Upload } from "lucide-react";

const PersonModal = ({
  visible,
  editingPerson,
  onCancel,
  onOk,
  form,
  onFieldChange,
  onImageUpload,
  uploadingImage,
  teams = [],
}) => {
  return (
    <Modal
      title={editingPerson ? "Chỉnh sửa nhân sự" : "Thêm nhân sự"}
      open={visible}
      onCancel={onCancel}
      onOk={onOk}
      okText={editingPerson ? "Lưu thay đổi" : "Thêm mới"}
      cancelText="Hủy"
    >
      <Form layout="vertical" className="mt-3">
        <Form.Item label="Loại">
          <Select
            value={form.kind}
            onChange={(value) => onFieldChange("kind", value)}
            options={[
              { label: "Cầu thủ", value: "Player" },
              { label: "HLV", value: "Coach" },
            ]}
          />
        </Form.Item>
        <Form.Item label="Tên">
          <Input value={form.name} onChange={(e) => onFieldChange("name", e.target.value)} />
        </Form.Item>
        <Form.Item label="Quốc tịch">
          <Input value={form.nationality} onChange={(e) => onFieldChange("nationality", e.target.value)} />
        </Form.Item>
        <Form.Item label="Ngày sinh">
          <Input type="date" value={form.dateOfBirth} onChange={(e) => onFieldChange("dateOfBirth", e.target.value)} />
        </Form.Item>
        {form.kind === "Player" ? (
          <>
            <Form.Item label="Vị trí">
              <Input value={form.position} onChange={(e) => onFieldChange("position", e.target.value)} />
            </Form.Item>
            <Form.Item label="Số áo">
              <Input type="number" value={form.jerseyNumber} onChange={(e) => onFieldChange("jerseyNumber", e.target.value)} />
            </Form.Item>
          </>
        ) : (
          <Form.Item label="Tóm tắt sự nghiệp">
            <Input.TextArea rows={3} value={form.careerSummary} onChange={(e) => onFieldChange("careerSummary", e.target.value)} />
          </Form.Item>
        )}
        <Form.Item label="Đội bóng">
          <Select
            allowClear
            showSearch
            value={form.currentTeam || undefined}
            onChange={(value) => onFieldChange("currentTeam", value || "")}
            options={(teams || []).map((team) => ({ label: team.name, value: team._id }))}
            filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
          />
        </Form.Item>
        <Form.Item label={<span className="flex items-center gap-1.5"><Link className="w-3.5 h-3.5" /> Ảnh đại diện</span>}>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={form.avatar}
                onChange={(e) => onFieldChange("avatar", e.target.value)}
                placeholder="Dán link ảnh hoặc tải lên..."
                prefix={<Link className="w-3.5 h-3.5 text-slate-400" />}
                allowClear
                className="flex-1"
              />
              <AntUpload
                beforeUpload={(file) => {
                  onImageUpload(file);
                  return false;
                }}
                showUploadList={false}
              >
                <Button icon={<Upload className="w-4 h-4 mr-1 inline" />} loading={uploadingImage}>
                  Tải lên
                </Button>
              </AntUpload>
            </div>
            {form.avatar && (
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <img
                  src={form.avatar}
                  alt="Preview"
                  className="h-12 w-12 rounded-full object-cover border border-slate-200 bg-white"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span className="text-xs text-slate-500 truncate flex-1">{form.avatar}</span>
              </div>
            )}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PersonModal;
