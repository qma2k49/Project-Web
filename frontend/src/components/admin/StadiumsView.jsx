import React from "react";
import { Input } from "antd";
import { Search, Plus } from "lucide-react";
import PageHeader from "./PageHeader";

const StadiumsView = ({ loading, stadiumSearchTerm, onStadiumSearchChange, filteredStadiums, onAddStadium, onEditStadium }) => {
  return (
    <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
      <PageHeader
        title="Danh sách sân vận động"
        description="Quản lý thông tin sân vận động và thêm mới sân mới nhanh chóng."
        action={
          <button
            onClick={onAddStadium}
            className="inline-flex items-center gap-2 bg-[#0d1726] hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm sân vận động
          </button>
        }
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <label className="text-sm font-semibold text-slate-700">Tìm sân vận động</label>
        <Input
          size="large"
          prefix={<Search className="w-4 h-4 text-slate-400" />}
          placeholder="Nhập tên sân, thành phố hoặc quốc gia..."
          value={stadiumSearchTerm}
          onChange={(e) => onStadiumSearchChange(e.target.value)}
          className="mt-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-gray-200 bg-white p-10 text-center text-slate-500">
            Đang tải dữ liệu sân vận động...
          </div>
        ) : filteredStadiums.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-gray-200 bg-white p-10 text-center text-slate-500">
            Không tìm thấy sân vận động phù hợp.
          </div>
        ) : (
          filteredStadiums.map((stadium) => (
            <div key={stadium._id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-slate-900">{stadium.name}</h2>
                  <p className="text-sm text-slate-500">{stadium.city || "Chưa cập nhật"}</p>
                </div>
                <button
                  onClick={() => onEditStadium(stadium)}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  Sửa
                </button>
              </div>

              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {stadium.image ? (
                  <img src={stadium.image} alt={stadium.name} className="h-28 w-full object-cover" />
                ) : (
                  <div className="flex h-28 items-center justify-center text-sm text-slate-400">
                    Chưa có ảnh
                  </div>
                )}
              </div>

              <div className="mt-3 text-sm text-slate-600 space-y-1">
                <p>• Sức chứa: {stadium.capacity || "Chưa cập nhật"}</p>
                <p>• Năm xây dựng: {stadium.builtYear || "Chưa cập nhật"}</p>
                <p>• Quốc gia: {stadium.country || "Chưa cập nhật"}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
};

export default StadiumsView;
