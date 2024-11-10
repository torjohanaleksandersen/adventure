import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 5000;

io.on('connection', socket => {

})


app.use(express.static("public"))

httpServer.listen(PORT);