// DEPENDENCIES
// Base dependencies
var logfmt = require("logfmt");
var express = require("express");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var io = require("socket.io");
var nodeMailer = require("nodemailer");
// Start up express server
var app = express();
var server = app.listen(8080);
// Connect socket.io to server
var io = io.listen(server);
// Library for managing redis
var rooms = require("./rooms");
// Library for managing users
var users = require("./users");

var seeds = require("./seeds");

// reset database
seeds.seed();

// CONFIGURATION
// Logging
app.use(logfmt.requestLogger());
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
          res.cookie("token", cookie);
        }
        res.redirect("/");
      });
    }
  });
});

// Forgot password
app.get("/forgotpassword", function(req, res) {
  res.sendFile("public/html/forgotpassword.html", {"root": __dirname});
});

app.post("/forgot-password", function(req, res) {
  var email = req.body.email;
  users.userExists(email, function(err) {
    if (err) {
      // email not found
      res.cookie("alert", err);
      res.redirect("/forgotpassword");
    } else {
      var transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'csc301ututor@gmail.com',
          pass: 'team1ututor'
        }
      });
      
      users.getPassword(email, function(cookie) {
        transporter.sendMail({
          from: 'csc301ututor@gmail.com',
          to: email,
          subject: 'Password recovery',
          text: "Your password is: " + cookie
        });
      });
      res.cookie("alert", "Password sent to " + email);
      res.redirect("/");
    }
  });
});

function startsWith(base, str) {
  return base.substring( 0, str.length ) === str;
}

// SOCKET
// User connected
io.on("connection", function(socket) {

  var email = null;
  var username = null;
  var cookies = socket.handshake.headers.cookie.split("; ");
  var currentRoom = "global";

  for (var i = 0; i < cookies.length; i++) {
    if (startsWith(cookies[i], "token=")) {
      username = cookies[i].replace("token=", "").replace(/\%40(.*)/, "");
      email = cookies[i].replace("token=", "").replace("%40", "@");
    }
  }

  // Initializing client-side...
  rooms.getRooms(function(allRooms) {
    users.getSubscribedRooms(email, function(subscribedRooms) {
      socket.emit("initialize", {
        username: username,
        rooms: allRooms,
        subscribedRooms: subscribedRooms
      });
    });
  });

  socket.on("roomsubscribe", function(room) {
    users.subscribeToRoom(email, room, function(reply) {
      users.getSubscribedRooms(email, function(subscribedRooms) {
        socket.emit("updaterooms", subscribedRooms);
      });
    });
  });

  socket.on("roomunsubscribe", function(room) {
  });

  socket.on("roomjoin", function(room) {
    currentRoom = room;
    socket.join(room, function() {
      rooms.addUser(room, username, function() {
        var msg = {type: 'user', user: username, event: 'join'};
        rooms.addMessage(room, msg, function() {
          rooms.getData(room, function(users, messages) {
            socket.emit("user", users);
            socket.emit("message", messages);
            socket.to(room).emit("user", users);
            socket.to(room).emit("message", messages);
          });
        });
      });
    });
  });

  socket.on("roomleave", function(room) {
    socket.leave(room, function() {
      rooms.removeUser(room, username, function() {
        var msg = {type: 'userevent', user: username, event: 'leave'};
        rooms.addMessage(room, msg, function() {
          rooms.getData(room, function(users, messages) {
            socket.emit("user", users);
            socket.emit("message", messages);
            socket.to(room).emit("user", users);
            socket.to(room).emit("message", messages);
          });
        });
      });
    });
  });

  // On receiving a message from the user
  socket.on("message", function(msg, room) {
    msg['type'] = "message";
    rooms.addMessage(room, msg, function() {
      rooms.getData(room, function(users, messages) {
        io.to(room).emit("message", messages);
      });
    });
  });


  // On user disconnect
  socket.on("disconnect", function() {
    var room = currentRoom;
    rooms.removeUser(room, username, function() {
      var msg = {type: 'userevent', user: username, event: 'leave'};
      rooms.addMessage(room, msg, function() {
        rooms.getData(room, function(users, messages) {
          socket.to(room).emit("user", users);
          socket.to(room).emit("message", messages);
        });
      });
    });
  });

});
