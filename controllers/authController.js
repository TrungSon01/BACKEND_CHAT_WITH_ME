const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const q = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    const [result] = await db.execute(q, [username, email, password]);
    res.status(200).json({ message: "Đăng ký thành công" });
  } catch (err) {
    console.error("Lỗi đăng ký:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const q = "SELECT * FROM users WHERE email = ?";

  try {
    const [rows] = await db.query(q, [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    // So sánh mật khẩu thuần
    if (rows[0].password !== password) {
      return res.status(401).json({ error: "Sai mật khẩu" });
    }

    return res.status(200).json({
      user: {
        userid: rows[0].userid,
        username: rows[0].username,
        email: rows[0].email,
      },
    });
  } catch (err) {
    console.error("Lỗi login:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
