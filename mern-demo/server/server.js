const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const Student = require('./models/student');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Câu 22: Tạo API GET /api/hello trả về thông báo xác nhận Backend đang hoạt động
app.get('/api/hello', (req, res) => {
  res.json({ message: "Backend đang hoạt động!" });
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Không thể lấy danh sách sinh viên' });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: 'Dữ liệu sinh viên không hợp lệ' });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    res.json(student);
  } catch (err) {
    res.status(400).json({ message: 'Dữ liệu sinh viên không hợp lệ' });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    res.json({ message: 'Đã xóa sinh viên thành công', student });
  } catch (err) {
    res.status(400).json({ message: 'Không thể xóa sinh viên' });
  }
});

// Câu 33: Kết nối Express Backend với MongoDB Atlas
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('Thiếu biến môi trường MONGODB_URI trong file .env');
  process.exitCode = 1;
} else {
  mongoose.connect(mongoUri)
  .then(() => {
    console.log("MongoDB Atlas connected successfully!");
    
    // Câu 21: Xây dựng Express Server chạy trên port 5000
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Lỗi kết nối MongoDB:", err.message);
  });
}