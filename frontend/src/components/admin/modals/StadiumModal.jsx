import React from "react";
import { Modal, Form, Input, Upload as AntUpload, Button } from "antd";
import { Link, Upload } from "lucide-react";

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
        <Form.Item label={<span className="flex items-center gap-1.5"><Link className="w-3.5 h-3.5" /> Ảnh sân vận động</span>}>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={form.image}
                onChange={(e) => onFieldChange("image", e.target.value)}
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
            {form.image && (
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <img
                  src={form.image}
                  alt="Preview"
                  className="h-16 w-24 rounded-lg object-cover border border-slate-200 bg-white"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span className="text-xs text-slate-500 truncate flex-1">{form.image}</span>
              </div>
            )}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StadiumModal;
