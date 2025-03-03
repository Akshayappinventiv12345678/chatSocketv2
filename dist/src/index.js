"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const readline_1 = __importDefault(require("readline"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000"; // Socket.io server URL
const socket = (0, socket_io_client_1.io)(SERVER_URL);
// Create Readline Interface
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout,
});
let room = "room1";
let username = "user1";
let password = "pass1";
// Function to send messages
const sendMessage = () => {
    rl.question("> ", (message) => {
        if (message.toLowerCase() === "exit") {
            console.log("Exiting chat...");
            socket.disconnect();
            process.exit(0);
        }
        socket.emit("sendMessage", { room, sender: username, message });
        sendMessage();
    });
};
// Connect to server
socket.on("connect", () => {
    console.log("Connected to chat server ✅");
    socket.emit("login", { username, password });
    console.log("login success");
    socket.on("loginSuccess", data => {
        socket.emit("joinRoom", room);
        console.log("login success and joined ", data);
        sendMessage();
    });
});
// Listen for messages
socket.on("receiveMessage", (data) => {
    console.log("Recieving Message", data);
    if (data.sender !== username) {
        console.log(`\n${data.sender}: ${data.message}\n> `);
    }
});
// Handle disconnection
socket.on("disconnect", () => {
    console.log("Disconnected from server ❌");
    process.exit(0);
});
//# sourceMappingURL=index.js.map