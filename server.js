// server.js
const express = require("express");
const cors = require("cors");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const db = require("./db");
const pool = require("./db");
dotenv.config();

const app = express();

// Create server based on environment
let server;
let wss;

// Check if we're in production (Railway) or development
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;

if (isProduction) {
  // In production (Railway), use HTTP server - Railway handles SSL termination
  server = http.createServer(app);
  wss = new WebSocket.Server({ server });
  console.log("🚀 Production server created (Railway SSL termination)");
} else {
  // In development, try to use local SSL certificates
  try {
    const privateKey = fs.readFileSync(path.join(__dirname, 'ssl', 'private.key'), 'utf8');
    const certificate = fs.readFileSync(path.join(__dirname, 'ssl', 'certificate.crt'), 'utf8');
    
    const credentials = { key: privateKey, cert: certificate };
    server = https.createServer(credentials, app);
    wss = new WebSocket.Server({ server });
    console.log("🔒 Development HTTPS server created with SSL certificates");
  } catch (error) {
    // Fallback to HTTP if SSL certificates are not available
    server = http.createServer(app);
    wss = new WebSocket.Server({ server });
    console.log("⚠️ Development HTTP server created (SSL certificates not found)");
  }
}

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

const clients = new Map(); // Map userid -> ws

wss.on("connection", (ws) => {
  console.log("🔗 New WebSocket connection established");
  
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      // Khi client đăng ký userId để nhận tin nhắn
      if (data.type === "register") {
        clients.set(data.user_id, ws);
     
        console.log(`🔗 User ${data.user_id} đã kết nối WebSocket.`);
        console.log(`📊 Total connected users: ${clients.size}`);
        console.log(`👥 Connected users: ${Array.from(clients.keys()).join(', ')}`);
        return;
      }

      // Khi client gửi tin nhắn
      if (data.type === "message") {
        const { sender_id, receiver_id, content } = data;

        // Ghi vào CSDL
        try {
          const q =
            "INSERT INTO messages (sender_id, receiver_id, content, timestamp) VALUES (?, ?, ?, NOW())";
          const [result] = await db.execute(q, [sender_id, receiver_id, content]);
          console.log(
            `💬 Tin nhắn từ ${sender_id} gửi ${receiver_id}: ${content}`
          );
          
          // Lấy timestamp vừa tạo
          const timestampQuery = "SELECT timestamp FROM messages WHERE id = ?";
          const [timestampResult] = await db.execute(timestampQuery, [result.insertId]);
          const timestamp = timestampResult[0]?.timestamp;
          
          // Gửi tin đến người nhận nếu online
          const receiverWs = clients.get(receiver_id);
          if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(
              JSON.stringify({
                type: "message",
                sender_id,
                receiver_id,
                content,
                timestamp: timestamp,
              })
            );
            console.log(`📤 Sent message to receiver ${receiver_id}`);
          } else {
            console.log(`📤 Receiver ${receiver_id} is offline`);
          }
          
          // Gửi tin nhắn về cho sender để confirm
          const senderWs = clients.get(sender_id);
          if (senderWs && senderWs.readyState === WebSocket.OPEN) {
            senderWs.send(
              JSON.stringify({
                type: "message",
                sender_id,
                receiver_id,
                content,
                timestamp: timestamp,
              })
            );
            console.log(`📤 Sent confirmation to sender ${sender_id}`);
          }
        } catch (err) {
          console.error("❌ Lỗi ghi DB:", err);
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
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối CSDL:", err.message);
  });

app.get("/", (req, res) => {
  const protocol = server instanceof https.Server ? 'https' : 'http';
  res.send(`Backend API is running on ${protocol}! Use /api/auth/* endpoints.`);
});

// Debug endpoint to check WebSocket connections
app.get("/debug/websocket", (req, res) => {
  const connectedUsers = Array.from(clients.keys());
  res.json({
    connectedUsers,
    totalConnections: clients.size,
    serverType: isProduction ? 'Production (Railway)' : 'Development'
  });
});

// Khởi động server sau khi kết nối DB thành công
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
  
  if (isProduction) {
    // In production (Railway), Railway handles SSL termination
    console.log(`🚀 Production server running on Railway`);
    console.log(`🔌 WebSocket server ready for WSS connections`);
  } else {
    // In development, show local URLs
    const protocol = server instanceof https.Server ? 'https' : 'http';
    const wsProtocol = server instanceof https.Server ? 'wss' : 'ws';
    console.log(`🚀 Server đang chạy tại ${protocol}://localhost:${PORT}`);
    console.log(`🔌 WebSocket server sẵn sàng tại ${wsProtocol}://localhost:${PORT}`);
  }
});
