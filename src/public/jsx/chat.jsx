/** @jsx React.DOM */

// main component
var Chat = React.createClass({
  getInitialState: function() {
    return {
      username: null,
      rooms: [],
      subscribedRooms: [],
      currentRoom: "global",
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
    // on userlist change
    socket.on("user", this.getUsers);
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

    socket.emit("roomjoin", this.state.currentRoom);

    scrollChatToBottom();
  },
  getMessages: function(messages) {
    this.setState({messages: messages});
    scrollChatToBottom(); // only if it's the one we're currently in
  },
  getUsers: function(users) {
    this.setState({users: users});
  },
  updateSubscribedRooms: function(subscribedRooms) {
    this.setState({subscribedRooms: subscribedRooms});
  },
  changeCurrentRoom: function(room) {
    // quit one room, join the new one
    socket.emit("roomleave", this.state.currentRoom);
    socket.emit("roomjoin", room);
    this.setState({currentRoom: room});
    scrollChatToBottom();
  },
  render: function() {
    return (
      <div id="chat">
        <aside className="sidebar pull-left">
          <SubscribedRooms currentRoom={this.state.currentRoom}
                           subscribedRooms={this.state.subscribedRooms}
                           changeCurrentRoom={this.changeCurrentRoom} />
          <RoomList currentRoom={this.state.currentRoom}
                    rooms={this.state.rooms}
                    changeCurrentRoom={this.changeCurrentRoom} />
        </aside>
        <Conversation messages={this.state.messages} />
        <aside className="sidebar pull-right">
          <OptionList />
          <UserList username={this.state.username} users={this.state.users} />
        </aside>
        <Modal />
        <MessageInput username={this.state.username} currentRoom={this.state.currentRoom} />
      </div>
    );
  }
});

var Modal = React.createClass({
  getInitialState: function() {
    return {
      currentPassword: "",
      newPassword: ""};
  },
  handleChange: function(event) {
    this.setState({currentPassword: event.target.value});
    this.setState({newPassword: event.target.value});
  },
  render: function() {
    var currentPassword = this.state.value;
    var newPassword = this.state.value;
    return (
      <div id="modal">
        <form class="change-password-form" action="change-password" method="POST">
          <div class="form-group">
            <input type="password" id="current-password" placeholder="Enter your current password" name="currentPassword"
                value={currentPassword} onChange={this.handleChange} class="form-control login-field"/>
            <input type="password" id="new-password" placeholder="Enter your new password" name="newPassword"
                value={newPassword} onChange={this.handleChange} class="form-control login-field"/>
          </div>
          <input type="submit" id="change-password-button" class="btn btn-primary btn-lg btn-block" value="Change password"/>
        </form>
      </div>
    )
  }
});

var ChangePassword = React.createClass({
  handleClick: function(e) {
    var elem = document.getElementById("modal");
    elem.style.visibility = "visible";
  },
  render: function() {
    return (<button onClick={this.handleClick}>Change password</button>);
  }
});

var OptionList = React.createClass({
  render: function() {
    var logout = function () {
      // remove session cookie
      eraseCookie('token');
      window.location.reload();
    }
    return (
      <div className="options">
        <ul>
          <li id="logout" onClick={logout}><a href="#">Sign out</a></li>
          <ChangePassword />
        </ul>
      </div>
    );
  }
});

var RoomList = React.createClass({
  subscribeRoom: function(e) {
    var room = e.currentTarget.id;
    socket.emit("roomsubscribe", room);
    this.props.changeCurrentRoom(room);
  },
  render: function() {
    var renderRoom = function(room) {
      if (this.props.currentRoom == room) {
        return (<li id={room}>{room}</li>);
      } else {
        return (<li id={room} onClick={this.subscribeRoom}><a href="#">{room}</a></li>);
      }
    }.bind(this);
    return (
        <ul>
          <li>All Rooms</li>
          {this.props.rooms.map(renderRoom)}
        </ul>
    );
  }
});

var SubscribedRooms = React.createClass({
  changeRoom: function(e) {
    var room = e.currentTarget.id;
    this.props.changeCurrentRoom(room);
  },
  render: function() {
    var renderRoom = function(room) {
      if (this.props.currentRoom == room) {
        return (<li id={room}>{room}</li>);
      } else {
        return (<li id={room} onClick={this.changeRoom}><a href="#">{room}</a></li>);
      }
    }.bind(this);

    return (<ul>
              <li>Subscribed Rooms</li>
              {this.props.subscribedRooms.map(renderRoom)}
      </ul>)
  }
});

var UserList = React.createClass({
  render: function() {
    var renderUser = function(user) {
      if (user == this.props.username) {
        return null;
      } else {
        return (<li>{user}</li>);
      }
    }.bind(this);
    return (
      <div>
        <ul>
          {this.props.username ? <li id="user">{this.props.username}</li> : null}
          {this.props.users.map(renderUser)}
        </ul>
      </div>
    );
  }
});

// Conversation pane
var Conversation = React.createClass({
  render: function() {
    var renderMessage = function(message) {
      if (message["type"] == "message") {
        return <Message author={message.author} text={message.text} />
      } else {
        return <UserEvent event={message} />
      }
    };
    return (<ul id="conversation">{this.props.messages.map(renderMessage)}</ul>);
  }
});

var Message = React.createClass({
  render: function() {
    var message = this.props.author + ": " + this.props.text;
    return (<li className="message">{message}</li>);
  }
});

var UserEvent = React.createClass({
  render: function() {
    var message = "";
    if (this.props.event.event == "join") {
      message = this.props.event.user + " has joined the room.";
    } else {
      message = this.props.event.user + " has left the room.";
    }

    return (<li className="event">{message}</li>);
  }
});

var MessageInput = React.createClass({
  getInitialState: function() {
    return {text: ""};
  },
  messageUpdated: function(e) {
    this.setState({text: e.target.value});
    scrollChatToBottom();
  },
  handleEnter: function(e) {
    scrollChatToBottom();
    if (e.which == 13 && !e.shiftKey) {
      e.preventDefault();
      if (this.state.text) {
        var message = { author: this.props.username, text: this.state.text };
        socket.emit("message", message, this.props.currentRoom);
      }
      this.setState({text: ""});
    }
  },
  render: function() {
      return (
        <textarea id="message-input" className="animated"
                placeholder="Write message..." value={this.state.text}
                onChange={this.messageUpdated} onKeyDown={this.handleEnter}
        />
      );
  }
});

function scrollChatToBottom() {
  var objDiv = document.getElementById("chat");
  objDiv.scrollTop = objDiv.scrollHeight;
}

var socket = io.connect(window.location.hostname);
React.renderComponent(<Chat />, document.body);
