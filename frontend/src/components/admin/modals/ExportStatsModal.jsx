import React, { useState } from "react";
import { Modal, DatePicker, Checkbox, Radio, Button, message } from "antd";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

const { RangePicker } = DatePicker;

const ExportStatsModal = ({ visible, onClose }) => {
  const [exportType, setExportType] = useState("excel");
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success(`Đã xuất dữ liệu thống kê định dạng ${exportType.toUpperCase()} thành công!`);
      onClose();
    }, 1000);
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
          <Download className="w-5 h-5 text-emerald-500" />
          <span>Xuất báo cáo & Thống kê hệ thống</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={500}
    >
      <div className="space-y-5 py-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
            Khoảng thời gian báo cáo
          </label>
          <RangePicker className="w-full" size="large" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
            Dữ liệu cần xuất
          </label>
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <Checkbox defaultChecked>Báo cáo tỷ số & Lịch thi đấu các trận</Checkbox>
            <br />
            <Checkbox defaultChecked>Bảng xếp hạng giải đấu mới nhất</Checkbox>
            <br />
            <Checkbox defaultChecked>Thống kê thẻ phạt & Danh sách ghi bàn</Checkbox>
            <br />
            <Checkbox>Nhật ký hệ thống (Audit logs)</Checkbox>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
            Định dạng tập tin
          </label>
          <Radio.Group value={exportType} onChange={(e) => setExportType(e.target.value)} size="large">
            <Radio.Button value="excel">
              <FileSpreadsheet className="w-4 h-4 inline mr-1 text-green-600" /> Excel (.xlsx)
            </Radio.Button>
            <Radio.Button value="pdf">
              <FileText className="w-4 h-4 inline mr-1 text-red-600" /> PDF Document
            </Radio.Button>
          </Radio.Group>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button size="large" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleExport}
            className="bg-emerald-600 hover:bg-emerald-700 font-semibold flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Tải báo cáo ngay
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportStatsModal;
