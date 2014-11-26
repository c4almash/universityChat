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
	rooms.createRoom("dota2");
	rooms.createRoom("cs:go");
	rooms.addUser("dota2", "student1");
	rooms.addUser("dota2", "student2");
	rooms.addUser("dota2", "student3");
	rooms.addUser("cs:go", "student1");
	rooms.addUser("cs:go", "student4");
	rooms.addMessage("dota2", { author: "student1", text: "MidOrFeed" });
	rooms.addMessage("cs:go", { author: "student4", text: "rush b" });
};

exports.seed = seed;