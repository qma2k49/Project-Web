import React from "react";
import { Input } from "antd";
import { Search } from "lucide-react";
import PageHeader from "./PageHeader";

const PersonnelView = ({ loading, playerSearchTerm, coachSearchTerm, onPlayerSearchChange, onCoachSearchChange, filteredPlayers, filteredCoaches, onAddPlayer, onAddCoach, onEditPerson }) => {
  return (
    <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
      <PageHeader
        title="Cầu thủ & Huấn luyện viên"
        description="Tra cứu và quản lý cầu thủ và HLV bằng hai bộ tìm kiếm riêng biệt."
        action={
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-gray-200 text-xs shadow-xs transition-colors"
          >
            Quay lại tổng quan
          </button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Cầu thủ</h2>
              <p className="text-sm text-slate-500">Tìm theo tên, quốc tịch, vị trí hoặc đội bóng.</p>
            </div>
            <button
              onClick={onAddPlayer}
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              Thêm
            </button>
          </div>

          <Input
            size="large"
            prefix={<Search className="w-4 h-4 text-slate-400" />}
            placeholder="Tìm cầu thủ..."
            value={playerSearchTerm}
            onChange={(e) => onPlayerSearchChange(e.target.value)}
            className="mt-4"
          />

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Đang tải...</div>
            ) : filteredPlayers.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Không có cầu thủ phù hợp.</div>
            ) : (
              filteredPlayers.map((person) => (
                <div key={person._id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {person.avatar ? (
                        <img src={person.avatar} alt={person.name} className="h-11 w-11 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                          {person.name?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">{person.name}</p>
                        <p className="text-sm text-slate-500">{person.nationality || "Chưa cập nhật"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onEditPerson(person)}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      Sửa
                    </button>
                  </div>
                  <div className="mt-3 text-sm text-slate-600 space-y-1">
                    <p>• Vị trí: {person.position || "Chưa cập nhật"}</p>
                    <p>• Số áo: {person.jerseyNumber || "Chưa cập nhật"}</p>
                    <p>• Đội: {person?.currentTeam?.name || "Chưa cập nhật"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Huấn luyện viên</h2>
              <p className="text-sm text-slate-500">Tìm theo tên, quốc tịch hoặc đội bóng đang dẫn dắt.</p>
            </div>
            <button
              onClick={onAddCoach}
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              Thêm
            </button>
          </div>

          <Input
            size="large"
            prefix={<Search className="w-4 h-4 text-slate-400" />}
            placeholder="Tìm HLV..."
            value={coachSearchTerm}
            onChange={(e) => onCoachSearchChange(e.target.value)}
            className="mt-4"
          />

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Đang tải...</div>
            ) : filteredCoaches.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Không có HLV phù hợp.</div>
            ) : (
              filteredCoaches.map((person) => (
                <div key={person._id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {person.avatar ? (
                        <img src={person.avatar} alt={person.name} className="h-11 w-11 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                          {person.name?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">{person.name}</p>
                        <p className="text-sm text-slate-500">{person.nationality || "Chưa cập nhật"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onEditPerson(person)}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      Sửa
                    </button>
                  </div>
                  <div className="mt-3 text-sm text-slate-600 space-y-1">
                    <p>• Tóm tắt sự nghiệp: {person.careerSummary || "Chưa cập nhật"}</p>
                    <p>• Đội: {person?.currentTeam?.name || "Chưa cập nhật"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default PersonnelView;
