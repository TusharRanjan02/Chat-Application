import express from "express";
import { Server } from 'socket.io';
import chats from "./data/data.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js"
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import chatRoutes from "./routes/chatRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"
import path from "path"

const app = express();
dotenv.config();
connectDB();

app.use(express.json());  // to accept json data

app.get('/',(req,res) =>{
    res.send("Api is Running")
})

app.use('/api/user', userRoutes );
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT

const server =app.listen(PORT, console.log(`Server started on port ${PORT}`))


const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:3000",
      // credentials: true,
    },
  });
io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
    });
  
    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  
    socket.on("new message", (newMessageRecieved) => {
      var chat = newMessageRecieved.chat;
  
      if (!chat.users) return console.log("chat.users not defined");
  
      chat.users.forEach((user) => {
        if (user._id == newMessageRecieved.sender._id) return;
  
        socket.in(user._id).emit("message recieved", newMessageRecieved);
      });
    });
  
    socket.off("setup", () => {
      console.log("USER DISCONNECTED");
      socket.leave(userData._id);
    });
  });