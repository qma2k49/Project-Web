import React, { useState } from "react";
import { Modal, Form, Select, DatePicker, InputNumber, message, Button } from "antd";
import { PlusCircle } from "lucide-react";
import { createMatch, fetchRoundNames } from "../../../api";

const { Option } = Select;

const CreateMatchModal = ({ visible, onClose, onSuccess, tournaments = [], teams = [], stadiums = [] }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [selectedHomeTeam, setSelectedHomeTeam] = useState(null);
  const [roundNamesList, setRoundNamesList] = useState([]);
  const [loadingRounds, setLoadingRounds] = useState(false);

  const handleTournamentChange = async (tournamentId) => {
    if (!tournamentId) {
      setRoundNamesList([]);
      return;
    }
    try {
      setLoadingRounds(true);
      const list = await fetchRoundNames(tournamentId);
      setRoundNamesList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Lỗi tải danh sách tên vòng đấu:", err);
      message.error("Lỗi tải danh sách tên vòng đấu!");
    } finally {
      setLoadingRounds(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      if (values.homeTeam === values.awayTeam) {
        message.error("Đội nhà và đội khách không được trùng nhau!");
        setSubmitting(false);
        return;
      }

      const matchData = {
        tournamentId: values.tournamentId,
        homeTeam: values.homeTeam,
        awayTeam: values.awayTeam,
        stadium: values.stadium,
        roundName: values.roundName,
        matchTime: values.matchTime ? values.matchTime.toDate() : new Date(),
        status: values.status || "NOT STARTED",
        homeScore: values.homeScore || 0,
        awayScore: values.awayScore || 0,
      };

      await createMatch(matchData);
      message.success("Đã tạo mới trận đấu thành công!");
      form.resetFields();
      setSelectedHomeTeam(null);
      setRoundNamesList([]);
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (err) {
      console.error(err);
      message.error("Tạo trận đấu thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
          <PlusCircle className="w-5 h-5 text-emerald-500" />
          <span>Thêm trận đấu mới</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      centered
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: "NOT STARTED",
          homeScore: 0,
          awayScore: 0,
        }}
        className="mt-4"
      >
        {/* Tournament Selection */}
        <Form.Item
          name="tournamentId"
          label="Giải đấu"
          rules={[{ required: true, message: "Vui lòng chọn giải đấu!" }]}
        >
          <Select
            placeholder="Chọn giải đấu..."
            size="large"
            onChange={async (val) => {
              form.setFieldsValue({ roundName: undefined });
              await handleTournamentChange(val);
            }}
          >
            {tournaments.map((t) => (
              <Option key={t._id} value={t._id}>
                {t.name} ({t.season || "2026"})
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Teams Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item
            name="homeTeam"
            label="Đội nhà"
            rules={[{ required: true, message: "Vui lòng chọn đội nhà!" }]}
          >
            <Select
              placeholder="Chọn đội nhà..."
              size="large"
              onChange={(value) => {
                setSelectedHomeTeam(value);
                form.setFieldsValue({ awayTeam: undefined });
              }}
            >
              {teams.map((team) => (
                <Option key={team._id} value={team._id}>
                  {team.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="awayTeam"
            label="Đội khách"
            rules={[
              { required: true, message: "Vui lòng chọn đội khách!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  if (value === getFieldValue("homeTeam")) {
                    return Promise.reject(new Error("Đội khách không được trùng với đội nhà!"));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Select placeholder="Chọn đội khách..." size="large" allowClear>
              {teams
                .filter((team) => team._id !== selectedHomeTeam)
                .map((team) => (
                  <Option key={team._id} value={team._id}>
                    {team.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </div>

        {/* Stadium & Round */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item name="stadium" label="Sân vận động">
            <Select placeholder="Chọn sân vận động..." size="large" allowClear>
              {stadiums.map((s) => (
                <Option key={s._id} value={s._id}>
                  {s.name} ({s.city || "Việt Nam"})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="roundName"
            label="Vòng đấu / Giai đoạn"
            rules={[{ required: true, message: "Vui lòng chọn vòng đấu!" }]}
          >
            <Select
              placeholder={loadingRounds ? "Đang tải vòng đấu..." : "Chọn vòng đấu..."}
              size="large"
              loading={loadingRounds}
              disabled={!roundNamesList.length}
            >
              {roundNamesList.map((rn) => (
                <Option key={rn._id} value={rn._id}>
                  {rn.roundName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* Status & Match Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item name="status" label="Trạng thái trận đấu">
            <Select size="large">
              <Option value="NOT STARTED">Chưa bắt đầu</Option>
              <Option value="LIVE">Trực tiếp (LIVE)</Option>
              <Option value="FINISHED">Đã kết thúc</Option>
            </Select>
          </Form.Item>

          <Form.Item name="matchTime" label="Thời gian thi đấu">
            <DatePicker showTime format="YYYY-MM-DD HH:mm" className="w-full" size="large" />
          </Form.Item>
        </div>

        {/* Scores */}
        <Form.Item noStyle dependencies={["status"]}>
          {({ getFieldValue }) => {
            const status = getFieldValue("status");
            if (status === "NOT STARTED") return null;
            return (
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
                <Form.Item name="homeScore" label="Bàn thắng Đội nhà" className="mb-0">
                  <InputNumber min={0} className="w-full" size="large" />
                </Form.Item>
                <Form.Item name="awayScore" label="Bàn thắng Đội khách" className="mb-0">
                  <InputNumber min={0} className="w-full" size="large" />
                </Form.Item>
              </div>
            );
          }}
        </Form.Item>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Button size="large" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
          >
            Lưu vào MongoDB
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateMatchModal;
