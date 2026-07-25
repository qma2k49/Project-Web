import StadiumModel from "../models/stadium.model.js";


const stadiumController = {
    createStadium: async (req, res) => {
        try {
            const { name, capacity, builtYear, city, country, image } = req.body;

            const existingStadium = await StadiumModel.findOne({ name });
            if (existingStadium) {
                return res.status(400).json({ message: 'Sân vận động này đã tồn tại!' });
            }

            const newStadium = new StadiumModel({
                name,
                capacity,
                builtYear,
                city,
                country,
                image
            });

            await newStadium.save();
            return res.status(201).json({ message: 'Tạo sân vận động thành công', data: newStadium });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getAllStadiums: async (req, res) => {
        try {
            let stadiums = await StadiumModel.find().sort({ createdAt: -1 });
            if (stadiums.length === 0) {
                stadiums = await StadiumModel.insertMany(defaultStadiums);
            }
            return res.status(200).json({ data: stadiums });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getStadiumById: async (req, res) => {
        try {
            const stadium = await StadiumModel.findById(req.params.id);
            if (!stadium) {
                return res.status(404).json({ message: 'Không tìm thấy sân vận động!' });
            }
            return res.status(200).json({ data: stadium });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    updateStadium: async (req, res) => {
        try {
            const { name, capacity, builtYear, city, country, image } = req.body;
            const stadium = await StadiumModel.findById(req.params.id);
            if (!stadium) {
                return res.status(404).json({ message: 'Không tìm thấy sân vận động!' });
            }
            stadium.name = name;
            stadium.capacity = capacity;
            stadium.builtYear = builtYear;
            stadium.city = city;
            stadium.country = country;
            stadium.image = image;
            await stadium.save();
            return res.status(200).json({ message: 'Cập nhật sân vận động thành công', data: stadium });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    deleteStadium: async (req, res) => {
        try {
            const stadium = await StadiumModel.findByIdAndDelete(req.params.id);
            if (!stadium) {
                return res.status(404).json({ message: 'Không tìm thấy sân vận động!' });
            }
            return res.status(200).json({ message: 'Xóa sân vận động thành công' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

export default stadiumController;