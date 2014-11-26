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
      React.DOM.div({id: "chat"}, 
        React.DOM.aside(null, 
          OptionList(null), 
          UserList({username: this.state.username, users: this.state.users})
        ), 
        RoomList({rooms: this.state.rooms, changeCurrentRoom: this.changeCurrentRoom}), 
        SubscribedRooms({subscribedRooms: this.state.subscribedRooms, changeCurrentRoom: this.changeCurrentRoom}), 
        Conversation({messages: this.state.messages}), 
        MessageInput({username: this.state.username, currentRoom: this.state.currentRoom})
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
      React.DOM.div({className: "options"}, 
        React.DOM.ul(null, 
          React.DOM.li({id: "logout", onClick: logout}, React.DOM.a({href: ""}, "Sign out"))
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
      return (React.DOM.li({id: room, onClick: this.subscribeRoom}, room));
    }.bind(this);
    return (
        React.DOM.ul(null, 
          React.DOM.li(null, "All Rooms"), 
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
      return (React.DOM.li({id: room, onClick: this.changeRoom}, room));
    }.bind(this);

    return (React.DOM.ul(null, 
              React.DOM.li(null, "Subscribed Rooms"), 
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
        return (React.DOM.li(null, user));
      }
    }.bind(this);
    return (
      React.DOM.div(null, 
        React.DOM.ul(null, 
          this.props.username ? React.DOM.li({id: "user"}, this.props.username) : null, 
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
      return Message({author: message.author, text: message.text})
    };
    return (React.DOM.ul({id: "conversation"}, this.props.messages.map(renderMessage)));
  }
});

var Message = React.createClass({displayName: 'Message',
  render: function() {
    var message = this.props.author + ": " + this.props.text;
    return (React.DOM.li(null, message));
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
    if (this.props.currentRoom) {
      return (
        React.DOM.textarea({id: "message-input", className: "animated", 
                placeholder: "Write message...", value: this.state.text, 
                onChange: this.messageUpdated, onKeyDown: this.handleEnter}
      )
      );
    } else {
      return null;
    }
  }
});

function scrollChatToBottom() {
  var objDiv = document.getElementById("chat");
  objDiv.scrollTop = objDiv.scrollHeight;
}

var socket = io.connect(window.location.hostname);
React.renderComponent(Chat(null), document.body);
