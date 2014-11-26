// This module registers room names and ips.
var redis = require("redis"),
    client = redis.createClient();

// Error logging
client.on("error", function(err) {
  console.log("redis error: " + err);
});

// SCHEMA: ip keys are like ip:192.168.1.1
//         room names are like room:room_name

// check if room with ip ipAddress exists
// returns bool
function doesRoomExist(room, callback) {
  var key = "room:" + room;
  client.exists(key, function(err, reply) {
    if (reply) {
      callback(true);
    } else {
      callback(false);
    }
  });
}


function getRoom(room, callback) {
  var key = "room:" + room;
  client.get(key, function(err, reply) {
    callback(reply);
  });
}

function createRoom(room) {
  var key = "room:" + room
  client.rpush(room, "");
}

// pushes json-encoded message object to room
function addMessage(room, message) {
  var key = "history:" + room;
  client.rpush(key, JSON.stringify(message));
}

// pushes user to room
function addUser(room, user) {
  var key = "users:" + room;
  client.rpush(key, user);
}

// removes user from room
function removeUser(room, user) {
  var key = "users:" + room;
  client.lrem(key, 0, user);
}

// gets current users, message history of room
function getData(room, callback) {
  var messagesKey = "history:" + room;
  var usersKey = "users:" + room;
  client.lrange(messagesKey, 0, -1, function(err, messages) {
    client.lrange(usersKey, 0, -1, function(err, users) {
      callback(users, messages);
    });
  });
}

exports.doesRoomExist = doesRoomExist;
exports.getRoom = getRoom;
exports.createRoom = createRoom;
exports.addMessage = addMessage;
exports.addUser = addUser;
exports.removeUser = removeUser;
exports.getData = getData;
