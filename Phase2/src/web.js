// DEPENDENCIES
// Base dependencies
var logfmt = require("logfmt");
var express = require("express");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var io = require("socket.io");
// Start up express server
var app = express();
var server = app.listen(8080);
// Connect socket.io to server
var io = io.listen(server);
// Library for managing redis
var rooms = require("./rooms");
// Library for managing users
var users = require("./users");

// CONFIGURATION
// Logging
app.use(logfmt.requestLogger());
// For viewing ips
app.enable("trust proxy");
// For parsing body for post params
app.use(bodyParser.urlencoded({ extended: false }));
// For parsing cookies
app.use(cookieParser());

// SERVER
// Serve static assets
app.use("/static", express.static(__dirname + "/public"));

// User visited root
app.get("/", function(req, res) {
  // instead of checking whether room exists, check whether
  // user is signed in
  var cookie = req.cookies.token;

  users.isLoggedIn(cookie, function(loggedIn) {
    if (loggedIn) {
      res.sendFile("public/html/chat.html", {"root": __dirname});
    } else {
      res.sendFile("public/html/index.html", {"root": __dirname});
    }
  });
});

// User sign-up / logged in
app.post("/login", function(req, res) {
  var email = req.body.email,
      password = req.body.password;

  users.authenticate(email, password, function(cookie) {
    if (cookie) {
      // login success
      res.cookie("token", cookie);
      res.redirect("/");
    } else {
      // invalid info, treat it as sign-up
      users.registerUser(email, password, function(err) {
        if (err) {
          // user already exist => wrong sign-in info
          res.cookie("alert", err);
        } else {
          // registeriation success, prompt sign-in
          res.cookie("alert", "Congratz, you are now one of us. " +
            "Sign-in again with the same credential you've just used.");
        }
        res.redirect("/");
      });
    }
  });
});


// User asked to create a room
app.post("/", function(req, res) {
  rooms.createRoom(req.ip, req.body.privacy, function(room) {
    res.redirect(room);
  });
});

function startsWith(base, str) {
  return base.substring( 0, str.length ) === str;
}

// SOCKET
// User connected
io.on("connection", function(socket) {
  // This is the room name (pathname)
  var room = "global";
  var username = null;

  var cookies = socket.handshake.headers.cookie.split("; ");

  for (var i = 0; i < cookies.length; i++) {
    if (startsWith(cookies[i], "token=")) {
      username = cookies[i].replace("token=", "").replace(/\%40(.*)/, "");
    }
  }

  socket.join(room);
  socket.broadcast.to(room).emit("join", username);
  rooms.addUser(room, username);

  // Initializing client-side...
  console.log("initializing user...");
  rooms.getData(room, function(users, messages) {
    var users = users;
    var messageHistory = messages.map(JSON.parse);
    socket.emit("initialize", {
      username: username,
      users: users,
      messages: messageHistory
    });
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
