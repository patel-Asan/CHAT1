import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userroute.js";
import messageRouter from "./routes/messagerotes.js";
import { Server } from "socket.io";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);


// Initialize Socket.IO
export const io = new Server(server, {
  cors: {origin: "*"}
})

//store online users
export const userSocketMap = {};

//socket connection
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected:", userId);

  if (userId) userSocketMap[userId] = socket.id;

  //Emit online users to all clients
  io.emit("onlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    delete userSocketMap[userId]; 
    io.emit("onlineUsers", Object.keys(userSocketMap));
  });
  
})

// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());



// Test API route
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

//connect mongo
await connectDB();

// Server port
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});






// npm init -y
// npm install bcryptjs cloudinary cors dotenv jsonwebtoken mongoose socket.io
//import statement for use   "type":"module",   in json