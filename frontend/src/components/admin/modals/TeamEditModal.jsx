import React from "react";
import { Modal, Form, Input, Select, Upload as AntUpload, Button } from "antd";
import { Link, Upload } from "lucide-react";

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
        <Form.Item label={<span className="flex items-center gap-1.5"><Link className="w-3.5 h-3.5" /> Logo đội bóng</span>}>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={form.logo}
                onChange={(e) => onFieldChange("logo", e.target.value)}
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
            {form.logo && (
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <img
                  src={form.logo}
                  alt="Preview"
                  className="h-12 w-12 rounded-lg object-cover border border-slate-200 bg-white"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span className="text-xs text-slate-500 truncate flex-1">{form.logo}</span>
              </div>
            )}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TeamEditModal;
