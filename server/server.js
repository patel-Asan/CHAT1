import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userroute.js";
import messageRouter from "./routes/messagerotes.js";
import groupRouter from "./routes/grouprotes.js";
import featureRouter from "./routes/featureroutes.js";
import { Server } from "socket.io";
import Call from "./model/Call.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: "*" }
});

export const userSocketMap = {};
const activeCalls = new Map();

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected:", userId);

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("onlineUsers", Object.keys(userSocketMap));

  // Typing events
  socket.on("typing", ({ receiverId }) => {
    const receiverSocket = userSocketMap[receiverId];
    if (receiverSocket) io.to(receiverSocket).emit("typing", { senderId: userId });
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocket = userSocketMap[receiverId];
    if (receiverSocket) io.to(receiverSocket).emit("stopTyping", { senderId: userId });
  });

  // Group typing
  socket.on("groupTyping", ({ groupId }) => {
    socket.to(groupId).emit("groupTyping", { groupId, senderId: userId });
  });

  socket.on("groupStopTyping", ({ groupId }) => {
    socket.to(groupId).emit("groupStopTyping", { groupId, senderId: userId });
  });

  // Join group rooms
  socket.on("joinGroup", ({ groupId }) => {
    socket.join(groupId);
  });

  socket.on("leaveGroup", ({ groupId }) => {
    socket.leave(groupId);
  });

  // ==================== WebRTC Call Signaling ====================
  socket.on("call:start", ({ to, room, callId, type }) => {
    const targetSocket = userSocketMap[to];
    if (targetSocket) {
      io.to(targetSocket).emit("call:incoming", { from: userId, room, callId, type });
      activeCalls.set(callId, { callerId: userId, calleeId: to, type, startedAt: new Date() });
    } else {
      socket.emit("call:error", { message: "User is offline" });
    }
  });

  socket.on("call:accept", ({ to, room }) => {
    const targetSocket = userSocketMap[to];
    if (targetSocket) io.to(targetSocket).emit("call:accepted", { from: userId, room });
  });

  socket.on("call:reject", ({ to, callId }) => {
    const callData = activeCalls.get(callId);
    if (callData) {
      Call.create({
        caller: callData.callerId, callee: callData.calleeId,
        type: callData.type, status: "rejected",
        startedAt: callData.startedAt, endedAt: new Date(),
      }).catch(() => {});
      activeCalls.delete(callId);
    }
    const targetSocket = userSocketMap[to];
    if (targetSocket) io.to(targetSocket).emit("call:rejected", { from: userId, callId });
  });

  socket.on("call:end", ({ to, callId, duration }) => {
    const callData = activeCalls.get(callId);
    if (callData) {
      Call.create({
        caller: callData.callerId, callee: callData.calleeId,
        type: callData.type, status: "answered",
        startedAt: callData.startedAt, endedAt: new Date(),
        duration: duration || 0,
      }).catch(() => {});
      activeCalls.delete(callId);
    }
    const targetSocket = userSocketMap[to];
    if (targetSocket) io.to(targetSocket).emit("call:ended", { from: userId, callId });
  });

  socket.on("call:cancel", ({ to, callId }) => {
    const callData = activeCalls.get(callId);
    if (callData) {
      Call.create({
        caller: callData.callerId, callee: callData.calleeId,
        type: callData.type, status: "cancelled",
        startedAt: callData.startedAt, endedAt: new Date(),
      }).catch(() => {});
      activeCalls.delete(callId);
    }
    const targetSocket = userSocketMap[to];
    if (targetSocket) io.to(targetSocket).emit("call:cancelled", { from: userId, callId });
  });

  socket.on("call:busy", ({ to, callId }) => {
    const callData = activeCalls.get(callId);
    if (callData) {
      Call.create({
        caller: callData.callerId, callee: callData.calleeId,
        type: callData.type, status: "missed",
        startedAt: callData.startedAt, endedAt: new Date(),
      }).catch(() => {});
      activeCalls.delete(callId);
    }
    const targetSocket = userSocketMap[to];
    if (targetSocket) io.to(targetSocket).emit("call:busy", { from: userId, callId });
  });

  // WebRTC signaling
  socket.on("webrtc:offer", ({ to, offer }) => {
    const targetSocket = userSocketMap[to];
    if (targetSocket) io.to(targetSocket).emit("webrtc:offer", { from: userId, offer });
  });

  socket.on("webrtc:answer", ({ to, answer }) => {
    const targetSocket = userSocketMap[to];
    if (targetSocket) io.to(targetSocket).emit("webrtc:answer", { from: userId, answer });
  });

  socket.on("webrtc:ice", ({ to, candidate }) => {
    const targetSocket = userSocketMap[to];
    if (targetSocket) io.to(targetSocket).emit("webrtc:ice", { from: userId, candidate });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("onlineUsers", Object.keys(userSocketMap));
    io.emit("peer:gone", { userId });

    // Clean up any active calls for this user
    for (const [callId, data] of activeCalls.entries()) {
      if (data.callerId === userId || data.calleeId === userId) {
        const wasCaller = data.callerId === userId;
        Call.create({
          caller: data.callerId, callee: data.calleeId,
          type: data.type, status: wasCaller ? "cancelled" : "missed",
          startedAt: data.startedAt, endedAt: new Date(),
        }).catch(() => {});
        activeCalls.delete(callId);
      }
    }
  });
});

app.use(express.json({ limit: "10mb" }));
app.use(cors());

app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/groups", groupRouter);
app.use("/api/features", featureRouter);

const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
server.on("error", (err) => {
  console.error("Server error:", err.message);
});

export default server;
