// Library for managing redis
var rooms = require("./rooms");;

// This module registers room names and ips.
var redis = require("redis"),
    client = redis.createClient();

// Error logging
client.on("error", function(err) {
  console.log("redis error: " + err);
});

function seed() {
	rooms.createRoom("global", function(success) {
      success? console.log('global room created.') : console.log('global room already exist.')
    });
	rooms.createRoom("csc301");
//	rooms.addUser("global", "studentA");
//	rooms.addUser("global", "studentB");
//	rooms.addMessage("global", { author: "studentA", text: "foo" });
//	rooms.addMessage("global", { author: "studentB", text: "bar" });
};

exports.seed = seed;
