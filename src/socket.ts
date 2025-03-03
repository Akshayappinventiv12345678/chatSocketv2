import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
// import { Kafka } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});



interface Message {
  room: string;
  sender: string;
  message: string;
  timestamp: string;
  socketId:string;
}


// Socket.io logic
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("login",(data:{user:string,password:string})=>{

    console.log("Login success",data); 
    io.to(socket.id).emit("loginSuccess","login success"); 

  })

  // User joins a room
  socket.on("joinRoom", (room: string) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  // Handle chat messages
  socket.on("sendMessage", async (data: { room: string; sender: string; message: string }) => {
    const { room, sender, message } = data;
    if (!room || !sender || !message) return;

    const newMessage: Message = {
      room,
      sender,
      message,
      timestamp: new Date().toISOString(),
      socketId:socket.id
    };

    try {
      console.log(" sharing recieved",newMessage)
    
      io.to(room).emit("receiveMessage", newMessage);
    } catch (error) {
      console.error("Error sending message to Kafka:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Socket Server running on port ${PORT}`));
