/** @jsx React.DOM */

// main component
var Chat = React.createClass({displayName: 'Chat',
  getInitialState: function() {
    return {
      username: null,
      rooms: [],
      subscribedRooms: [],
      currentRoom: null,
      users: [],
      messages: []
    };
  },
  componentDidMount: function() {
    // initialization
    socket.on("initialize", this.initialize);
    // on receiving a message from the server
    // gets updated chat for that room
    socket.on("message", this.getMessages);
    // on another user joining
    socket.on("join", this.userJoined);
    // on another user quitting
    socket.on("quit", this.userQuit);
    // update subscribed rooms
    socket.on("updaterooms", this.updateSubscribedRooms);
    // getting info on a rooms
    socket.on("roomInfo", this.roomInfo);
  },
  initialize: function(data) {
    this.setState({
      username: data.username,
      rooms: data.rooms,
      subscribedRooms: data.subscribedRooms
    });

    // need to get all rooms history
    scrollChatToBottom();
  },
  getMessages: function(messages) {
    this.setState({messages: messages});
    //scrollChatToBottom(); // only if it's the one we're currently in
  },
  userJoined: function(user) {
    // add user that joined room to the user list
    this.setState({users: this.state.users.concat([user])});
  },
  userQuit: function(user) {
    var newUsers = this.state.users;
    newUsers.splice(newUsers.indexOf(user), 1);
    this.setState({users:newUsers});
  },
  updateSubscribedRooms: function(subscribedRooms) {
    this.setState({subscribedRooms: subscribedRooms});
  },
  changeCurrentRoom: function(room) {
    // quit one room, join the new one
    socket.emit("roomleave", this.state.currentRoom);
    socket.emit("roomjoin", room);
    this.setState({currentRoom: room});
  },
  render: function() {
    return (
      React.createElement("div", {id: "chat"}, 
        React.createElement("aside", {className: "sidebar pull-left"}, 
          React.createElement(SubscribedRooms, {subscribedRooms: this.state.subscribedRooms, changeCurrentRoom: this.changeCurrentRoom}), 
          React.createElement(RoomList, {rooms: this.state.rooms, changeCurrentRoom: this.changeCurrentRoom})
        ), 
        React.createElement(Conversation, {messages: this.state.messages}), 
        React.createElement("aside", {className: "sidebar pull-right"}, 
          React.createElement(OptionList, null), 
          React.createElement(UserList, {username: this.state.username, users: this.state.users})
        ), 
        React.createElement(MessageInput, {username: this.state.username, currentRoom: this.state.currentRoom})
      )
    );
  }
});

var OptionList = React.createClass({displayName: 'OptionList',
  render: function() {
    var logout = function () {
      // remove session cookie
      eraseCookie('token');
      window.location.reload();
    }
    return (
      React.createElement("div", {className: "options"}, 
        React.createElement("ul", null, 
          React.createElement("li", {id: "logout", onClick: logout}, React.createElement("a", {href: "#"}, "Sign out"))
        )
      )
    );
  }
});

var RoomList = React.createClass({displayName: 'RoomList',
  subscribeRoom: function(e) {
    var room = e.currentTarget.id;
    socket.emit("roomsubscribe", room);
    this.props.changeCurrentRoom(room);
  },
  render: function() {
    var renderRoom = function(room) {
      // should strip out "ip" first
      return (React.createElement("li", {id: room, onClick: this.subscribeRoom}, React.createElement("a", {href: "#"}, room)));
    }.bind(this);
    return (
        React.createElement("ul", null, 
          React.createElement("li", null, "All Rooms"), 
          this.props.rooms.map(renderRoom)
        )
    );
  }
});

var SubscribedRooms = React.createClass({displayName: 'SubscribedRooms',
  changeRoom: function(e) {
    var room = e.currentTarget.id;
    this.props.changeCurrentRoom(room);
  },
  render: function() {
    var renderRoom = function(room) {
      // should strip out "ip" first
      return (React.createElement("li", {id: room, onClick: this.changeRoom}, React.createElement("a", {href: "#"}, room)));
    }.bind(this);

    return (React.createElement("ul", null, 
              React.createElement("li", null, "Subscribed Rooms"), 
              this.props.subscribedRooms.map(renderRoom)
      ))
  }
});

var UserList = React.createClass({displayName: 'UserList',
  render: function() {
    var renderUser = function(user) {
      if (user == this.props.username) {
        return null;
      } else {
        return (React.createElement("li", null, user));
      }
    }.bind(this);
    return (
      React.createElement("div", null, 
        React.createElement("ul", null, 
          this.props.username ? React.createElement("li", {id: "user"}, this.props.username) : null, 
          this.props.users.map(renderUser)
        )
      )
    );
  }
});

// Conversation pane
var Conversation = React.createClass({displayName: 'Conversation',
  render: function() {
    var renderMessage = function(message) {
      return React.createElement(Message, {author: message.author, text: message.text})
    };
    return (React.createElement("ul", {id: "conversation"}, this.props.messages.map(renderMessage)));
  }
});

var Message = React.createClass({displayName: 'Message',
  render: function() {
    var message = this.props.author + ": " + this.props.text;
    return (React.createElement("li", null, message));
  }
});

var MessageInput = React.createClass({displayName: 'MessageInput',
  getInitialState: function() {
    return {text: ""};
  },
  messageUpdated: function(e) {
    this.setState({text: e.target.value});
  },
  handleEnter: function(e) {
    if (e.which == 13 && !e.shiftKey) {
      e.preventDefault();
      var message = { author: this.props.username, text: this.state.text };
      socket.emit("message", message, this.props.currentRoom);
      this.setState({text: ""});
    }
  },
  render: function() {
    return (
      React.createElement("textarea", {id: "message-input", className: "animated", 
                placeholder: "Write message...", value: this.state.text, 
                onChange: this.messageUpdated, onKeyDown: this.handleEnter}
      )
    );
  }
});

function scrollChatToBottom() {
  var objDiv = document.getElementById("chat");
  objDiv.scrollTop = objDiv.scrollHeight;
}

var socket = io.connect(window.location.hostname);
React.renderComponent(React.createElement(Chat, null), document.body);
