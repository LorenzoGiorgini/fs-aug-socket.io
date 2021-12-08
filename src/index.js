import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

let onlineUsers = [];

app.use(cors());
app.get("/online-users", (req, res) => {
  res.send({ onlineUsers });
});

const httpServer = createServer(app);

const io = new Server(httpServer);

io.on("connection", (socket) => {

  socket.on("setUsername", ({ username, room }) => {
    onlineUsers.push({ username: username, socketId: socket.id, room: room });

    socket.join(room);
    console.log(socket.rooms);

    socket.emit("loggedin");
    socket.to(room).emit("newConnection");
  });

  socket.on("sendmessage", ({ message, room }) => {
    console.log("non è privato");
    socket.to(room).emit("message", message);
  });

  socket.on("sendPrivateMessage", ({ message, room }) => {
    socket.join(room);
    socket.to(room).emit("privateMessage", message);
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
  });
});

httpServer.listen(3030, () => {
  console.log("Listening on port 3030");
});