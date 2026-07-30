import React from "react";
import { Input } from "antd";
import { Search, Pencil, Upload, Plus } from "lucide-react";
import PageHeader from "./PageHeader";

const TeamsView = ({ loading, searchTerm, onSearchChange, filteredTeams, selectedTeam, onEditTeam, onBack, data, onOpenEditTeamModal, onAddTeam }) => {
  return (
    <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
      <PageHeader
        title="Tìm kiếm thông tin đội bóng"
        description="Nhập tên đội, tên viết tắt, thành phố hoặc sân nhà để tra cứu thông tin nhanh."
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={onAddTeam}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-colors cursor-pointer"
            >
              Thêm đội bóng
            </button>
          </div>
        }
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <label className="text-sm font-semibold text-slate-700">Tìm đội bóng</label>
        <Input
          size="large"
          prefix={<Search className="w-4 h-4 text-slate-400" />}
          placeholder="Nhập tên đội bóng..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="mt-2"
        />
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-slate-500">
          Đang tải dữ liệu đội bóng...
        </div>
      ) : !searchTerm ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-slate-500">
          Hãy nhập từ khóa để tra cứu thông tin đội bóng.
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-slate-500">
          Không tìm thấy đội bóng phù hợp.
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl font-black text-emerald-700 uppercase">
                {selectedTeam?.shortName || selectedTeam?.name?.slice(0, 2) || "CL"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedTeam?.name}</h2>
                <p className="text-sm text-slate-500">{selectedTeam?.shortName || "Tên viết tắt"}</p>
              </div>
            </div>
            <button
              onClick={() => onEditTeam(selectedTeam)}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              <Pencil className="w-4 h-4" />
              Chỉnh sửa
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Thành phố</p>
              <p className="mt-1 font-semibold text-slate-900">{selectedTeam?.city || "Chưa cập nhật"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sân nhà</p>
              <p className="mt-1 font-semibold text-slate-900">{selectedTeam?.homeStadium || "Chưa cập nhật"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">HLV</p>
              <p className="mt-1 font-semibold text-slate-900">{selectedTeam?.coachName || "Chưa cập nhật"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Số trận đấu</p>
              <p className="mt-1 font-semibold text-slate-900">{data.matches.filter((match) => {
                const homeId = typeof match.homeTeam === "object" ? match.homeTeam?._id : match.homeTeam;
                const awayId = typeof match.awayTeam === "object" ? match.awayTeam?._id : match.awayTeam;
                return homeId === selectedTeam?._id || awayId === selectedTeam?._id;
              }).length}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trạng thái</p>
              <p className="mt-1 font-semibold text-slate-900">{selectedTeam?.status || "Đang hoạt động"}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default TeamsView;
