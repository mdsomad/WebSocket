import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const secretKeyJWT = "asdasdsadasdasdasdsa";
const port = process.env.PORT || 3000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "asdasjdhkasdasdas" }, secretKeyJWT);

  res
    .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
    .json({
      message: "Login Success",
    });
});

io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res, (err) => {
    if (err) return next(err);

    const token = socket.request.cookies.token;
    if (!token) return next(new Error("Authentication Error"));

    const decoded = jwt.verify(token, secretKeyJWT);
    next();
  });
});

io.on("connection", (socket) => {
  console.log("User Connected id 👉", socket.id);
  // socket.emit("Welcome", `Welcome to tha server`);
  // socket.broadcast.emit("Welcome", `${socket.id} Joiend the server`);

  socket.on("message", ({ room, message }) => {
    console.log(room, message);
    // io.emit("Recevie-message 👉", data)
    // socket.broadcast.emit("Recevie-message 👉", data)
    io.to(room).emit("Recevie-message 👉", message);
  });

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User Joinesd Room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected 👉", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});
