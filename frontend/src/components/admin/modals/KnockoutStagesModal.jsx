import React, { useEffect, useState } from "react";
import { Modal, Input, Button, message, Checkbox } from "antd";
import { Trophy, Plus, Trash2, HelpCircle } from "lucide-react";

const KnockoutStagesModal = ({
  visible,
  onCancel,
  onOk,
  tournament = null,
}) => {
  const [stages, setStages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible && tournament) {
      if (Array.isArray(tournament.knockoutStages)) {
        setStages(
          tournament.knockoutStages.map((s, idx) => ({
            id: s._id || idx.toString(),
            name: s.name,
            hasLeg2: !!s.hasLeg2,
            hasThirdPlace: !!s.hasThirdPlace,
          }))
        );
      } else {
        setStages([]);
      }
    }
  }, [visible, tournament]);

  const handleAddStage = () => {
    setStages((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", hasLeg2: false, hasThirdPlace: false },
    ]);
  };

  const handleRemoveStage = (id) => {
    setStages((prev) => prev.filter((s) => s.id !== id));
  };

  const handleFieldChange = (id, field, value) => {
    setStages((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = async () => {
    if (stages.some((s) => !s.name.trim())) {
      message.error("Vui lòng nhập đầy đủ tên các vòng loại trực tiếp!");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        stages: stages.map((s, idx) => ({
          name: s.name.trim(),
          order: idx + 1,
          hasLeg2: !!s.hasLeg2,
          hasThirdPlace: !!s.hasThirdPlace,
        })),
      };
      await onOk(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
          <Trophy className="w-5 h-5 text-amber-500" />
          <div>
            <span className="font-bold text-slate-800 text-base block">
              Cấu hình vòng loại trực tiếp (Cup)
            </span>
            <span className="text-xs text-slate-400 font-normal mt-0.5">
              Giải đấu: {tournament?.name}
            </span>
          </div>
        </div>
      }
      open={visible}
      onOk={handleSubmit}
      confirmLoading={submitting}
      onCancel={onCancel}
      okText="Lưu cấu hình"
      cancelText="Hủy"
      centered
      width={540}
    >
      <div className="mt-4 space-y-4">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 text-xs text-slate-500 leading-normal">
          <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            Khai báo thứ tự các vòng knock-out (ví dụ: <b>Tứ kết</b>, <b>Bán kết</b>, <b>Chung kết</b>). 
            Tương ứng với mỗi vòng đấu, hệ thống sẽ tự động khởi tạo các vòng đấu lượt đi/lượt về thích hợp.
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto pr-1 space-y-3.5">
          {stages.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
              Chưa có vòng đấu nào được thêm. Bấm nút phía dưới để thêm mới.
            </div>
          ) : (
            stages.map((stage, index) => (
              <div
                key={stage.id}
                className="flex flex-col gap-3 p-4 bg-white border border-slate-150 rounded-xl shadow-2xs group hover:border-slate-350 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-slate-350 min-w-[20px] text-center">
                    #{index + 1}
                  </span>
                  <Input
                    value={stage.name}
                    onChange={(e) => handleFieldChange(stage.id, "name", e.target.value)}
                    placeholder="Tên vòng đấu (Ví dụ: Tứ kết, Bán kết, Chung kết...)"
                    className="flex-1"
                    size="large"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStage(stage.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                    title="Xóa vòng đấu"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
                
                <div className="flex gap-6 pl-8 text-xs text-slate-600">
                  <Checkbox
                    checked={stage.hasLeg2}
                    onChange={(e) => handleFieldChange(stage.id, "hasLeg2", e.target.checked)}
                  >
                    Đá 2 lượt (Lượt đi & Lượt về)
                  </Checkbox>
                  <Checkbox
                    checked={stage.hasThirdPlace}
                    onChange={(e) => handleFieldChange(stage.id, "hasThirdPlace", e.target.checked)}
                  >
                    Có trận tranh hạng ba
                  </Checkbox>
                </div>
              </div>
            ))
          )}
        </div>

        <Button
          type="dashed"
          onClick={handleAddStage}
          icon={<Plus className="w-4 h-4 inline mr-1" />}
          className="w-full h-11 flex items-center justify-center font-semibold text-slate-650 hover:text-emerald-700 hover:border-emerald-500 rounded-xl"
        >
          Thêm vòng đấu mới
        </Button>
      </div>
    </Modal>
  );
};

export default KnockoutStagesModal;
