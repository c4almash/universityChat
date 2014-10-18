// DEPENDENCIES
// Base dependencies
var logfmt = require("logfmt");
var express = require("express");
var bodyParser = require("body-parser");
var io = require("socket.io");
// Start up express server
var app = express();
var server = app.listen(8080);
// Connect socket.io to server
var io = io.listen(server);
// Library for managing redis
var rooms = require("./rooms");

// CONFIGURATION
// Logging
app.use(logfmt.requestLogger());
// For viewing ips
app.enable("trust proxy");
// For parsing body for post params
app.use(bodyParser.urlencoded({ extended: false }));

// SERVER
// Serve static assets
app.use("/static", express.static(__dirname + "/public"));

// User visited root
app.get("/", function(req, res) {
  var ip = req.ip;
  console.log("a user visited root with ip " + ip);
  rooms.doesRoomExist(ip, function(exists) {
    if (exists) {
      rooms.getRoom(ip, function(room) {
        res.redirect(room);
      });
    } else {
      res.sendFile("public/html/index.html", {"root": __dirname});
    }
  });
});

// User asked to create a room
app.post("/", function(req, res) {
  rooms.createRoom(req.ip, req.body.privacy, function(room) {
    res.redirect(room);
  });
});

// User visited something other than root
// (probably a room)
app.get("*", function(req, res) {
  var ip = req.ip;
  var path = req.path.replace("/", "");
  // check path of room and see whether room is privacy
  rooms.roomPrivacy(path, function(privacy) {
    // if privacy, only let user in if the ip related
    // to him is the room's
    if (privacy == "private") {
      rooms.getRoom(ip, function(room) {
        if (room == path) {
          res.sendFile("public/html/chat.html", {"root": __dirname});
        } else {
          res.send("Sorry, but you're not allowed.");
        }
      });
    // if it's public, doesn't matter
    } else if (privacy == "public") {
      res.sendFile("public/html/chat.html", {"root": __dirname});
    } else {
      // room is not defined yet
      res.send("This room has not been created yet.");
    }
  });
});

// SOCKET
// User connected
io.on("connection", function(socket) {
  // This is the room name (pathname)
  var room = socket.handshake.headers.referer.split("/").slice(-1)[0];
  var username = null;
  console.log("a user with ip " + socket.handshake.address.address + " connected to room " + room);
  socket.join(room);

  // Initializing client-side...
  console.log("initializing user...");
  rooms.getData(room, function(users, messages) {
    var users = users;
    var ip = socket.handshake.address.address;
    var messageHistory = messages.map(JSON.parse);
    socket.emit("initialize", {
      users: users,
      ip: ip,
      messages: messageHistory
    });
  });

  // User initialized their username
  socket.on("username", function(newUsername) {
    username = newUsername;
    // emit a join
    io.to(room).emit("join", username);
    // add user to room in redis (have to do it here
    // since we manually put username in client so
    // it won't appear twice)
    rooms.addUser(room, username);
  });
  
  // On receiving a message from the user
  socket.on("message", function(msg) {
    io.to(room).emit("message", msg);
    console.log(msg.author + " said " + msg.text + " in room " + room);
    rooms.addMessage(room, msg);
  });

  // On user disconnect
  socket.on("disconnect", function() {
    // Only consider it a disconnect if user has a username.
    // Otherwise pretend they never came
    if (username) {
      io.to(room).emit("quit", username);
      rooms.removeUser(room, username);
    }
  });
});
