import React from "react";
import { Modal, Form, Input, Select, Upload as AntUpload } from "antd";

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
        <Form.Item label="Ảnh">
          <div className="space-y-3">
            {form.avatar ? (
              <img src={form.avatar} alt="Person" className="h-20 w-20 rounded-full object-cover border border-slate-200" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                Ảnh
              </div>
            )}
            <AntUpload beforeUpload={(file) => {
              onImageUpload(file);
              return false;
            }} showUploadList={false}>
              <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                {uploadingImage ? "Đang tải..." : "Tải ảnh lên"}
              </button>
            </AntUpload>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PersonModal;
