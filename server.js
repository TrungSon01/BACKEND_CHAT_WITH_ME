// server.js
const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const db = require("./db");
const pool = require("./db");
dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

const clients = new Map(); // Map userid -> ws

wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      // Khi client đăng ký userId để nhận tin nhắn
      if (data.type === "register") {
        clients.set(data.user_id, ws);
     
        console.log(`🔗 User ${data.user_id} đã kết nối WebSocket.`);
        return;
      }

      // Khi client gửi tin nhắn
      if (data.type === "message") {
        const { sender_id, receiver_id, content } = data;

        // Ghi vào CSDL
        try {
          const q =
            "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)";
          await db.execute(q, [sender_id, receiver_id, content]);
          console.log(
            `💬 Tin nhắn từ ${sender_id} gửi ${receiver_id}: ${content}`
          );
        } catch (err) {
          console.error("❌ Lỗi ghi DB:", err);
        }

        // Gửi tin đến người nhận nếu online
        const receiverWs = clients.get(receiver_id);
        if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
          receiverWs.send(
            JSON.stringify({
              type: "message",
              sender_id,
              content,
            })
          );
        }
      }
    } catch (err) {
      console.error("❌ Lỗi xử lý tin nhắn:", err);
    }
  });

  ws.on("close", () => {
    for (const [user_id, socket] of clients.entries()) {
      if (socket === ws) {
        clients.delete(user_id);
        console.log(`❌ Mất kết nối WebSocket với user ${user_id}`);
      }
    }
  });
});
// check ket noi db
pool
  .getConnection()
  .then((connection) => {
    console.log("✅ Đã kết nối CSDL thành công!");
    connection.release(); // Trả connection về pool

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối CSDL:", err.message);
  });

app.get("/", (req, res) => {
  res.send("Backend API is running! Use /api/auth/* endpoints.");
});

// Khởi động server sau khi kết nối DB thành cônga
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
