import React from "react";
import { Modal, Form, Input, Upload as AntUpload } from "antd";

const StadiumModal = ({
  visible,
  editingStadium,
  onCancel,
  onOk,
  form,
  onFieldChange,
  onImageUpload,
  uploadingImage,
}) => {
  return (
    <Modal
      title={editingStadium ? "Chỉnh sửa sân vận động" : "Thêm sân vận động"}
      open={visible}
      onCancel={onCancel}
      onOk={onOk}
      okText={editingStadium ? "Lưu thay đổi" : "Thêm mới"}
      cancelText="Hủy"
    >
      <Form layout="vertical" className="mt-3">
        <Form.Item label="Tên sân vận động">
          <Input
            value={form.name}
            onChange={(e) => onFieldChange("name", e.target.value)}
            placeholder="Nhập tên sân"
          />
        </Form.Item>
        <Form.Item label="Sức chứa">
          <Input
            type="number"
            value={form.capacity}
            onChange={(e) => onFieldChange("capacity", e.target.value)}
            placeholder="Ví dụ: 40000"
          />
        </Form.Item>
        <Form.Item label="Năm xây dựng">
          <Input
            type="number"
            value={form.builtYear}
            onChange={(e) => onFieldChange("builtYear", e.target.value)}
            placeholder="Ví dụ: 2003"
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
        <Form.Item label="Ảnh sân vận động">
          <div className="space-y-3">
            {form.image ? (
              <img src={form.image} alt="Stadium" className="h-24 w-full rounded-xl object-cover border border-slate-200" />
            ) : (
              <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                Chưa có ảnh
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

export default StadiumModal;
