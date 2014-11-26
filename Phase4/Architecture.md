Architecture
Our app runs on the web, powered almost totally by Javascript. We use node.js
and the Express framework on the backend, which handles the webserver and
delivers the public assets. The instant messaging is handled using the socket.io
library. There is also a redis database instance that stores all the information
associated with the chat rooms and the users. We have created two DAOs: one that
interfaces as a library to perform actions on chat rooms and one for users. That
way, our main webserver need not be concerned with talking to redis at all, and
only needs to make calls such as createRoom(roomName).
On the front end, we made extensive use of Facebook's React library to make our
app interactive. React lets us manage state easily by creating reusable components.
The front-end of our chat app is enclosed in a big Chat component, which in it
contains several smaller components: an OptionList, UserList, RoomList,
Conversation, MessageInput which may enclose instances of other components (for
example, the Conversation component simply renders many Message components, which
each contain information). When the React component mounts (initializes), it
sets up the proper event handlers to communicate with socket.io on the backend,
and then emits a connection event. This way, we do not need to refresh the page
when new information comes in: the handlers update the state of the component,
which React then sees, calculates the DOM difference and generates the minimal
amount of javascript to update the page. We also used Sass to generate our
stylesheets.
One of the most significant architectural decisions is our use of Javascript
throughout the technology stack. This was a good decision, for several reasons:
Javascript is an easy language to learn, node.js (which powers the backend) is
very performant, and our socketing library enables quick communication.
Another significant architectural decision we made was using React on the front-end
instead of a more traditional stack (e.g. jQuery or Prototype). However, using React
made our lives as developers significantly easier, since it removed all imperative
considerations from our code. It also helped us keep track of the state of things
such as messages and rooms.
