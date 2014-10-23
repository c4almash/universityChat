// This module registers room names and ips.
var redis = require("redis"),
    client = redis.createClient();

// Error logging
client.on("error", function(err) {
  console.log("redis error: " + err);
});

// SCHEMA: user:email has hash field password password

// creates user, signs user in, and calls callback when done.
function registerUser(email, password, callback) {
  var key = "user:" + email;
  client.set(key, "password", password, function(err, reply) {
    callback();
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
  if (cookie) {
    callback(true);
  } else {
    callback(false);
  }
}

exports.registerUser = registerUser;
exports.authenticate = authenticate;
exports.isLoggedIn = isLoggedIn;
