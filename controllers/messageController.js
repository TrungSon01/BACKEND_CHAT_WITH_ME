const db = require("../db");

// Lấy lịch sử chat giữa hai user
exports.getChatHistory = async (req, res) => {
  const { userId1, userId2 } = req.query;
  if (!userId1 || !userId2) {
    return res.status(400).json({ error: "Thiếu userId1 hoặc userId2" });
  }
  try {
    const q = `SELECT * FROM messages WHERE 
      (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC`;
    const [rows] = await db.execute(q, [userId1, userId2, userId2, userId1]);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Lỗi lấy lịch sử chat:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Lấy danh sách user (trừ user hiện tại)
exports.getAllUsersExceptMe = async (req, res) => {
    const { userId } = req.query;
  
    // Kiểm tra xem userId có tồn tại không
    if (!userId) {
      return res.status(400).json({ error: "Thiếu userId trong query" });
    }
  
    try {
      const q = "SELECT userid, username, email FROM users WHERE userid != ?";
      const [rows] = await db.execute(q, [userId]);
      res.status(200).json(rows);
    } catch (err) {
      console.error("Lỗi lấy danh sách user:", err);
      res.status(500).json({ error: "Lỗi server" });
    }
  };
  