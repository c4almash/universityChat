/** @jsx React.DOM */

// main component
var Chat = React.createClass({
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
      <div id="chat">
        <aside className="sidebar pull-left">
          <SubscribedRooms subscribedRooms={this.state.subscribedRooms} changeCurrentRoom={this.changeCurrentRoom} />
          <RoomList rooms={this.state.rooms} changeCurrentRoom={this.changeCurrentRoom} />
        </aside>
        <Conversation messages={this.state.messages} />
        <aside className="sidebar pull-right">
          <OptionList />
          <UserList username={this.state.username} users={this.state.users} />
        </aside>
        <MessageInput username={this.state.username} currentRoom={this.state.currentRoom} />
      </div>
    );
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
      // should strip out "ip" first
      return (<li id={room} onClick={this.subscribeRoom}><a href="#">{room}</a></li>);
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
      // should strip out "ip" first
      return (<li id={room} onClick={this.changeRoom}><a href="#">{room}</a></li>);
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
      return <Message author={message.author} text={message.text} />
    };
    return (<ul id="conversation">{this.props.messages.map(renderMessage)}</ul>);
  }
});

var Message = React.createClass({
  render: function() {
    var message = this.props.author + ": " + this.props.text;
    return (<li>{message}</li>);
  }
});

var MessageInput = React.createClass({
  getInitialState: function() {
    return {text: ""};
  },
  messageUpdated: function(e) {
    this.setState({text: e.target.value});
  },
  handleEnter: function(e) {
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
//    if (this.props.currentRoom) {
      return (
        <textarea id="message-input" className="animated"
                placeholder="Write message..." value={this.state.text}
                onChange={this.messageUpdated} onKeyDown={this.handleEnter}
        />
      );
//    } else {
//      return null;
//    }
  }
});

function scrollChatToBottom() {
  var objDiv = document.getElementById("chat");
  objDiv.scrollTop = objDiv.scrollHeight;
}

var socket = io.connect(window.location.hostname);
React.renderComponent(<Chat />, document.body);
