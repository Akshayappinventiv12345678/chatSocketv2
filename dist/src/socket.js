"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
// import { Kafka } from "kafkajs";
const dotenv_1 = __importDefault(require("dotenv"));
const databasesync_1 = require("./databasesync");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
// Socket.io logic
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);
    socket.on("login", (data) => {
        console.log("Login success", data);
        io.to(socket.id).emit("loginSuccess", "login success");
    });
    // User joins a room
    socket.on("joinRoom", (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });
    // Handle chat messages
    socket.on("sendMessage", async (data) => {
        const { room, sender, message } = data;
        if (!room || !sender || !message)
            return;
        const newMessage = {
            room,
            sender,
            message,
            timestamp: new Date().toISOString(),
            socketId: socket.id
        };
        try {
            console.log(" sharing recieved", newMessage);
            io.to(room).emit("receiveMessage", newMessage);
            await (0, databasesync_1.publishData)(newMessage, room);
        }
        catch (error) {
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
//# sourceMappingURL=socket.js.map