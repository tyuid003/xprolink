const mongoose = require('mongoose');
const shortid = require('shortid');

const linkSchema = new mongoose.Schema({
  name: { type: String, default: 'New Link' }, // ชื่อลิงก์ย่อย
  url: { type: String, required: true }, // URL ปลายทาง
  active: { type: Boolean, default: true }, // สถานะเปิด/ปิด
  hits: { type: Number, default: 0 } // จำนวนครั้งที่ถูก redirect
});

const redirectSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    unique: true, // Company Name ต้องไม่ซ้ำกัน
    lowercase: true, // แปลงเป็นตัวพิมพ์เล็กทั้งหมด
    trim: true, // ลบช่องว่างหน้าหลัง
  },
  shortCode: { // ใช้สำหรับ URL redirect เช่น mydomain.com/go/:shortCode
    type: String,
    required: true,
    unique: true,
    default: shortid.generate
  },
  targetLinks: [linkSchema] // Array ของลิงก์ปลายทาง
}, { timestamps: true }); // เพิ่ม createdAt, updatedAt

module.exports = mongoose.model('Redirect', redirectSchema);