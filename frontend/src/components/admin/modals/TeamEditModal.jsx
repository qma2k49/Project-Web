import React from "react";
import { Modal, Form, Input, Select, Upload as AntUpload } from "antd";
import { Upload } from "lucide-react";

const TeamEditModal = ({
  visible,
  onCancel,
  onOk,
  form,
  onFieldChange,
  onImageUpload,
  uploadingImage,
  stadiums = [],
  coaches = [],
  editingTeam = null,
}) => {
  return (
    <Modal
      title={editingTeam ? "Chỉnh sửa thông tin đội bóng" : "Thêm đội bóng mới"}
      open={visible}
      onCancel={onCancel}
      onOk={onOk}
      okText={editingTeam ? "Lưu thay đổi" : "Thêm đội bóng"}
      cancelText="Hủy"
    >
      <Form layout="vertical" className="mt-3">
        <Form.Item label="Tên đội">
          <Input
            value={form.name}
            onChange={(e) => onFieldChange("name", e.target.value)}
            placeholder="Nhập tên đội bóng"
          />
        </Form.Item>
        <Form.Item label="Tên viết tắt">
          <Input
            value={form.shortName}
            onChange={(e) => onFieldChange("shortName", e.target.value)}
            placeholder="Ví dụ: HNFC"
          />
        </Form.Item>
        <Form.Item label="Thành phố">
          <Input
            value={form.city}
            onChange={(e) => onFieldChange("city", e.target.value)}
            placeholder="Ví dụ: Hà Nội"
          />
        </Form.Item>
        <Form.Item label="Quốc gia">
          <Input
            value={form.country}
            onChange={(e) => onFieldChange("country", e.target.value)}
            placeholder="Ví dụ: Việt Nam"
          />
        </Form.Item>
        <Form.Item label="Sân nhà">
          <Select
            showSearch
            allowClear
            placeholder="Chọn sân nhà"
            value={form.homeStadium || undefined}
            onChange={(value) => onFieldChange("homeStadium", value || "")}
            options={(stadiums || []).map((stadium) => ({
              label: stadium.name,
              value: stadium.name,
            }))}
            filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
          />
        </Form.Item>
        <Form.Item label="HLV">
          <Select
            showSearch
            allowClear
            placeholder="Chọn HLV"
            value={form.coach || undefined}
            onChange={(value) => {
              const selectedCoach = (coaches || []).find((coach) => coach._id === value);
              onFieldChange("coach", value || null);
              onFieldChange("coachName", selectedCoach?.name || "");
            }}
            options={(coaches || []).map((coach) => ({
              label: coach.name,
              value: coach._id,
            }))}
            filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
          />
        </Form.Item>
        <Form.Item label="Logo đội bóng">
          <div className="space-y-3">
            {form.logo ? (
              <img src={form.logo} alt="Team logo" className="h-20 w-20 rounded-xl object-cover border border-slate-200" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                <Upload className="h-6 w-6" />
              </div>
            )}
            <AntUpload beforeUpload={(file) => {
              onImageUpload(file);
              return false;
            }} showUploadList={false}>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                disabled={uploadingImage}
              >
                {uploadingImage ? "Đang tải..." : "Tải ảnh lên"}
              </button>
            </AntUpload>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TeamEditModal;
