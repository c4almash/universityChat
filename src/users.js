// This module registers room names
var redis = require("redis"),
    client = redis.createClient();

// Error logging
client.on("error", function(err) {
  console.log("redis error: " + err);
});

function endsWith(string, suffix) {
  return string.indexOf(suffix, string.length - suffix.length) !== -1;
};

function isValidUofTEmail(email) {
  return endsWith(email, "utoronto.ca") || endsWith(email, "toronto.edu");
}

// SCHEMA: user:email has hash field password password
// creates user, signs user in, and calls callback when done.
function registerUser(email, password, callback) {
  var key = "user:" + email;

  // check if key ends in mail.utoronto.ca
  if (!isValidUofTEmail(email)) {
    var error = "This email is not a valid University of Toronto email address.";
    callback(error);
    return;
  }

  // check that password is not empty
  if (password.length < 5) {
    var error = "Your password must be at least 5 characters.";
    callback(error);
    return;
  }

  // check if key exists already
  client.exists(key, function(err, reply) {
    // if it exists, reply with an error string
    if (reply) {
      var error = "Invalid login credential";
      callback(error);
      return;
    }
    client.hset(key, "password", password, function(err, reply) {
      // make user subscribe to the global chat room by default
      subscribeToRoom(email, 'global');
      callback(null);
    });
  });
}

// logs user in and calls callback when done
// with cookie to set
// cookie is just email for now
function authenticate(email, password, callback) {
  var key = "user:" + email;
  client.hget(key, "password", function(err, reply) {
    if (reply == password) {
      var cookie = email;
      callback(cookie);
    } else {
      callback(false);
    }
  });
}

// finds user, calls callback with true or false
function isLoggedIn(cookie, callback) {
  var key = "user:" + cookie;

  client.exists(key, function(err, reply) {
    if (reply) {
      callback(true);
    } else {
      callback(false);
    }
  });
}

/* PHASE 3 FUNCTIONS */
function getPassword(email, callback) {
  var key = "user:" + email;
  client.hget(key, "password", function(err, reply) {
  callback(reply);
  });
}

function userExists(email, callback) {
  var key = "user:" + email;

  client.exists(key, function(err, reply) {
    if (reply) {
      callback(null);
    } else {
      var error = "We couldn't find that email, try again?";
      callback(error);
    }
  });
}

function setPassword(email, newPassword, callback) {
  if (newPassword.length < 5) {
    var error = "Your password must be at least 5 characters.";
    callback(error);
    return;
  }

  var key = "user:" + email;
  client.hmset(key, "password", newPassword, function(err, reply) {
    callback(null);
  });
}

/* END OF PHASE 3 FUNCTIONS */

// uses JSON to store list of rooms.
function subscribeToRoom(email, room, callback) {
  var key = "user:" + email;
  client.hget(key, "subscribedRooms", function(err, reply) {
    var allRooms = JSON.parse(reply);
    
    if (allRooms) {
      if (allRooms.indexOf(room) == -1) {
        allRooms.push(room);
      }
    } else {
      allRooms = [room];
    }

    var newRoomsString = JSON.stringify(allRooms);

    client.hset(key, "subscribedRooms", newRoomsString);
    if (callback)
      callback(true);
  });
}

function unsubscribeFromRoom(email, room) {
  var key = "user:" + email;
  client.hget(key, "subscribedRooms", function(err, reply) {
    var allRooms = JSON.parse(reply);
    var index = allRooms.indexOf(room);
    if (index > -1) {
      allRooms.splice(index, 1);
    }

    var newRoomsString = JSON.stringify(allRooms);

    client.hset(key, "subscribedRooms", newRoomsString);
  });
}

// gets subscribed rooms and its info.
function getSubscribedRooms(email, callback) {
  var key = "user:" + email;
  client.hget(key, "subscribedRooms", function(err, reply) {
    if (err) {
      console.log("err: " + err);
    } else {
      var allRooms = JSON.parse(reply);
      if (allRooms) {
        callback(allRooms);
      } else {
        callback([]);
      }
    }
  });
}

exports.registerUser = registerUser;
exports.authenticate = authenticate;
exports.isLoggedIn = isLoggedIn;
exports.getPassword = getPassword;
exports.userExists = userExists;
exports.subscribeToRoom = subscribeToRoom;
exports.unsubscribeFromRoom = unsubscribeFromRoom;
exports.getSubscribedRooms = getSubscribedRooms;
exports.setPassword = setPassword;
