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
	rooms.createRoom("global");
	rooms.createRoom("csc301");
	rooms.createRoom("compsci");
	rooms.createRoom("biology");
	rooms.createRoom("math");
	rooms.createRoom("dota2");
	rooms.createRoom("cs:go");
//	rooms.addUser("global", "studentA");
//	rooms.addUser("global", "studentB");
//	rooms.addMessage("global", { author: "studentA", text: "foo" });
//	rooms.addMessage("global", { author: "studentB", text: "bar" });
};

exports.seed = seed;
