import { io } from "socket.io-client";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config();

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000"; // Socket.io server URL
const socket = io(SERVER_URL);

// Create Readline Interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let room: string="room1";
let username: string="user1";
let password:string="pass1"

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

 socket.emit("login",{username,password})
 console.log("login success");
 socket.on("loginSuccess",data=>{
 
  socket.emit("joinRoom",room);
  console.log("login success and joined ",data);
  sendMessage()
 

 })
});

// Listen for messages
socket.on("receiveMessage", (data: { sender: string; message: string }) => {
  console.log("Recieving Message",data)
  if (data.sender !== username) {
    console.log(`\n${data.sender}: ${data.message}\n> `);
  }
});

// Handle disconnection
socket.on("disconnect", () => {
  console.log("Disconnected from server ❌");
  process.exit(0);
});
