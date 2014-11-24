// This module registers room names
var redis = require("redis"),
    client = redis.createClient();

// Error logging
client.on("error", function(err) {
  console.log("redis error: " + err);
});

// SCHEMA: room names are like room:room_name

function doesRoomExist(name, callback) {
  var key = "room:" + name;
  client.exists(key, function(err, reply) {
    console.log('room', name, 'exist:', reply);
    callback(reply);
  });
}

// unused
function getRoom(name, callback) {
  var key = "room:" + name;
  client.get(key, function(err, reply) {
    callback(reply);
  });
}

function createRoom(name, callback) {
  doesRoomExist(name, function(reply) {
    if (reply) { // room already exist
      if (callback) {
        callback(false);
      }
    } else { // room doesn't exist, create it.
      client.sadd("rooms:taken", name);
      // set value to store the admin name?
      client.set("room:" + name, 0);
      if (callback) {
        callback(true);
      }
    }
  })
}

// pushes json-encoded message object to room
function addMessage(room_name, message, callback) {
  var key = "history:" + room_name;
  client.rpush(key, JSON.stringify(message), function(err, reply) {
    console.log("message: ", message, "saved to room:", room_name);
    if (callback) {
      callback();
      console.log("callback executed.");
    }
  });
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
      var parsedMessages = messages.map(JSON.parse);
      callback(users, parsedMessages);
    });
  });
}

function getRooms(callback) {
  client.smembers("rooms:taken", function(err, reply) {
    if (err) {
      console.log("error: " + err);
    } else {
      callback(reply);
    }
  });
}

exports.doesRoomExist = doesRoomExist;
exports.getRoom = getRoom;
exports.createRoom = createRoom;
exports.addMessage = addMessage;
exports.addUser = addUser;
exports.removeUser = removeUser;
exports.getData = getData;
exports.getRooms = getRooms;
