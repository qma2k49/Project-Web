import React from "react";
import { Input, Modal, Tooltip } from "antd";
import { Search, Pencil, Plus, Trash2, MapPin, Shield, Trophy } from "lucide-react";
import PageHeader from "./PageHeader";

const TeamsView = ({
  loading,
  searchTerm,
  onSearchChange,
  filteredTeams,
  onEditTeam,
  onDeleteTeam,
  data,
  onAddTeam
}) => {
  const handleDeleteConfirm = (team) => {
    Modal.confirm({
      title: "Xác nhận xóa đội bóng",
      content: `Bạn có chắc chắn muốn xóa đội bóng "${team.name}"? Hành động này không thể hoàn tác và có thể ảnh hưởng đến lịch thi đấu, bảng xếp hạng liên quan.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        if (onDeleteTeam) {
          onDeleteTeam(team._id);
        }
      },
    });
  };

  return (
    <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
      <PageHeader
        title="Quản lý thông tin đội bóng"
        description="Tra cứu, chỉnh sửa, thêm mới hoặc xóa thông tin các đội bóng trong hệ thống."
        action={
          <button
            onClick={onAddTeam}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all hover:shadow cursor-pointer"
          >
            Thêm đội bóng mới
          </button>
        }
      />

      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <label className="text-sm font-semibold text-slate-700">Tìm kiếm đội bóng</label>
        <Input
          size="large"
          prefix={<Search className="w-4 h-4 text-slate-400" />}
          placeholder="Nhập tên đội bóng, tên viết tắt, thành phố hoặc sân nhà để lọc..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
          className="mt-2"
        />
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Đang tải danh sách đội bóng...</span>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <Shield className="w-12 h-12 text-slate-300" />
          <span className="font-medium text-slate-600">Không tìm thấy đội bóng phù hợp</span>
          <span className="text-xs text-slate-400">Hãy thử nhập từ khóa khác hoặc bấm thêm đội bóng mới.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => {
            // Count total matches for this team
            const teamMatchesCount = data?.matches?.filter((match) => {
              const homeId = typeof match.homeTeam === "object" ? match.homeTeam?._id : match.homeTeam;
              const awayId = typeof match.awayTeam === "object" ? match.awayTeam?._id : match.awayTeam;
              return homeId === team._id || awayId === team._id;
            }).length || 0;

            return (
              <div
                key={team._id}
                className="group relative rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top section: logo and title */}
                  <div className="flex items-start gap-4">
                    {team.logo ? (
                      <img
                        src={team.logo}
                        alt={`${team.name} Logo`}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-100 bg-slate-50 group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "";
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-100 group-hover:scale-105 transition-transform duration-300">
                        {team.shortName || team.name?.slice(0, 2) || "TM"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate leading-snug group-hover:text-emerald-700 transition-colors" title={team.name}>
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 uppercase">
                          {team.shortName || "N/A"}
                        </span>
                        {team.city && (
                          <span className="text-xs text-slate-400 flex items-center gap-0.5 truncate">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {team.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mid section: details list */}
                  <div className="mt-5 space-y-2 border-t border-slate-50 pt-4 text-xs text-slate-500">
                    <div className="flex justify-between items-center">
                      <span>Sân nhà</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[150px]">{team.homeStadium || "Chưa cập nhật"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Huấn luyện viên</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[150px]">{team.coachName || "Chưa cập nhật"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Quốc gia</span>
                      <span className="font-semibold text-slate-700">{team.country || "Việt Nam"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Tổng số trận đã đá</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-full">
                        <Trophy className="w-3 h-3 text-amber-500" />
                        {teamMatchesCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom section: action buttons */}
                <div className="mt-5 pt-4 border-t border-slate-50 flex items-center gap-2">
                  <button
                    onClick={() => onEditTeam(team)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                    Chỉnh sửa
                  </button>
                  <Tooltip title="Xóa đội bóng">
                    <button
                      onClick={() => handleDeleteConfirm(team)}
                      className="inline-flex items-center justify-center rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default TeamsView;
