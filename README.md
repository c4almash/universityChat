How to set up the app
First, install node.js at nodejs.org and Redis at redis.io.

Then start up Redis in a terminal using redis-server.

Then cd to this src directory in another terminal, and issue

npm install. This installs any dependencies (if they aren't already in node_modules).

Then do node web.js - this starts the webserver at port 8080.

You should now be able to browse the site at http://localhost:8080 or http://0.0.0.0:8080.

Overview of the different pieces
web.js runs the server and endpoints for our app. When a user goes on the website, it must construct a response (for example, if a user goes to the home page, it must serve index.html and its related css/js files).

rooms.js is a service library employed by web.js that handles the low-level aspects of the Redis database. It takes care of tasks like creating channels, renaming users, etc.

The public folder is not too aptly named, since it contains things that aren't always served to the public. Nevertheless:

css/ contains the stylesheet files for styling. However, do not modify the files here! They are compiled from sass (sass-lang.com) in the scss/ folder. Edit the files there and then compile them to css/.

fonts/ contains some fonts that are loaded with the css.

html/ contains the html files that are sent in the response.

js/ contains the javascript libraries that are loaded for the chat (like socket.io and the React components). Feel free to add any other necessary libraries. However, do not modify the React files here! They are, like the css files, compiled from the jsx files.

jsx/ has the source React components. If you are working on the front-end you should be working mostly in this directory.

scss/ contains the source stylesheet files. If you are working on the front-end design you should be working mostly in this directory.
