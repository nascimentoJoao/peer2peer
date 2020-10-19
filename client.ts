import express from "express";
import socketio from "socket.io";
import path from "path";
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const app = express();
app.set("port", process.env.PORT || 4000);

let http = require("http").Server(app);
// set up socket.io and bind it to our
// http server.
let io = require("socket.io")(http);

app.get("/", (req: any, res: any) => {
  res.sendFile(path.resolve("./client/index.html"));
});

// whenever a user connects on port 3000 via
// a websocket, log that a user has connected
io.on("connection", function(socket: any) {
  console.log("a user connected");
});

const server = http.listen(4000, function() {
  console.log("listening on *:4000");
});

rl.question('type your command: ', function(name : String) {
    console.log('command was: ', name);
})

rl.on('close', function() {
    console.log('bye!');
    process.exit(0);
})