import PersonModel from '../models/person.model.js';

const personController = {
  getPersons: async (req, res) => {
    try {
      const { role } = req.query;
      const normalizedRole = role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : null;
      const filter = normalizedRole
        ? {
            $or: [{ role: normalizedRole }, { kind: normalizedRole }],
          }
        : {};

      const persons = await PersonModel.find(filter).populate('teamId');
      res.status(200).json(persons);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy danh sách nhân sự', error: error.message });
    }
  },

  createPerson: async (req, res) => {
    try {
      const newPerson = await PersonModel.create(req.body);
      res.status(201).json(newPerson);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi tạo nhân sự mới', error: error.message });
    }
  },

  updatePerson: async (req, res) => {
    try {
      const updated = await PersonModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi cập nhật nhân sự', error: error.message });
    }
  },

  deletePerson: async (req, res) => {
    try {
      await PersonModel.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Đã xóa nhân sự thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi xóa nhân sự', error: error.message });
    }
  }
};

export default personController;
