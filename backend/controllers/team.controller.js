import { TeamModel } from '../models/team.model.js';

const defaultSeedTeams = [
    { name: 'Hà Nội FC', shortName: 'HNFC', city: 'Hà Nội', country: 'Việt Nam', homeStadium: 'Sân Hàng Đẫy', coachName: 'Lê Đức Tuấn', logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=50&auto=format&fit=crop&q=80' },
    { name: 'Viettel FC', shortName: 'VTL', city: 'Hà Nội', country: 'Việt Nam', homeStadium: 'Sân Mỹ Đình', coachName: 'Phan Thanh Hùng', logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=50&auto=format&fit=crop&q=80' },
    { name: 'TP.HCM FC', shortName: 'HCMC', city: 'TP. Hồ Chí Minh', country: 'Việt Nam', homeStadium: 'Sân Thống Nhất', coachName: 'Nguyễn Văn Sỹ', logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=50&auto=format&fit=crop&q=80' },
    { name: 'SHB Đà Nẵng', shortName: 'DNG', city: 'Đà Nẵng', country: 'Việt Nam', homeStadium: 'Sân Hòa Xuân', coachName: 'Trần Minh Chiến', logo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=50&auto=format&fit=crop&q=80' },
    { name: 'Thép Xanh Nam Định', shortName: 'NDH', city: 'Nam Định', country: 'Việt Nam', homeStadium: 'Sân Nam Định', coachName: 'Vũ Hồng Việt', logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=50&auto=format&fit=crop&q=80' },
    { name: 'Hải Phòng FC', shortName: 'HPG', city: 'Hải Phòng', country: 'Việt Nam', homeStadium: 'Sân Lạch Tray', coachName: 'Chu Đình Nghiêm', logo: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=50&auto=format&fit=crop&q=80' },
];

const teamController = {
    createTeam: async (req, res) => {
        try {
            const { name, shortName, city, country, homeStadium, image, coach, coachName } = req.body;

            const existingTeam = await TeamModel.findOne({ name });
            if (existingTeam) {
                return res.status(400).json({ message: 'Tên đội bóng đã tồn tại!' });
            }

            const newTeam = await TeamModel.create({
                name,
                shortName: shortName || name.substring(0, 3).toUpperCase(),
                city,
                country,
                homeStadium,
                coachName,
                coach,
                logo: image
            });

            res.status(201).json({
                message: 'Tạo đội bóng thành công!',
                team: newTeam
            });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    getAllTeams: async (req, res) => {
        try {
            let teams = await TeamModel.find();
            if (teams.length === 0) {
                teams = await TeamModel.insertMany(defaultSeedTeams);
            }
            res.status(200).json(teams);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    getTeamById: async (req, res) => {
        try {
            const team = await TeamModel.findById(req.params.id);

            if (!team) {
                return res.status(404).json({ message: 'Không tìm thấy đội bóng!' });
            }

            res.status(200).json(team);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    updateTeam: async (req, res) => {
        try {
            const { name, shortName, city, country, homeStadium, coachName, coach, image, logo } = req.body;

            if (name) {
                const duplicateTeam = await TeamModel.findOne({ name, _id: { $ne: req.params.id } });
                if (duplicateTeam) {
                    return res.status(400).json({ message: 'Tên đội bóng đã tồn tại!' });
                }
            }

            const updatedTeam = await TeamModel.findByIdAndUpdate(
                req.params.id,
                {
                    ...(name !== undefined && { name }),
                    ...(shortName !== undefined && { shortName }),
                    ...(city !== undefined && { city }),
                    ...(country !== undefined && { country }),
                    ...(homeStadium !== undefined && { homeStadium }),
                    ...(coachName !== undefined && { coachName }),
                    ...(coach !== undefined && { coach }),
                    ...(logo !== undefined && { logo }),
                    ...(image !== undefined && { logo: image }),
                },
                { new: true }
            );

            if (!updatedTeam) {
                return res.status(404).json({ message: 'Không tìm thấy đội bóng!' });
            }

            res.status(200).json({
                message: 'Cập nhật đội bóng thành công!',
                team: updatedTeam
            });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    deleteTeam: async (req, res) => {
        try {
            const deletedTeam = await TeamModel.findByIdAndDelete(req.params.id);

            if (!deletedTeam) {
                return res.status(404).json({ message: 'Không tìm thấy đội bóng!' });
            }

            res.status(200).json({ message: 'Xóa đội bóng thành công!' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
};

export default teamController;