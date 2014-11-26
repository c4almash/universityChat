/** @jsx React.DOM */
// main component
var Chat = React.createClass({
  getInitialState: function() {
    return {
      username: null,
      users: [],
      messages: []
    };
  },
  componentDidMount: function() {
    // initialization
    socket.on("initialize", this.initialize);
    // on receiving a message from the server
    socket.on("message", this.getMessage);
    // on another user joining
    socket.on("join", this.userJoined);
    // on another user quitting
    socket.on("quit", this.userQuit);
  },
  initialize: function(data) {
    this.setState({
      username: data.username,
      users: data.users,
      messages: data.messages
    });
    scrollChatToBottom();
  },
  getMessage: function(message) {
    this.setState({messages: this.state.messages.concat([message])});
    scrollChatToBottom();
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
  render: function() {
    return (
      <div>
        <div id="chat">
          <UserList username={this.state.username} users={this.state.users} />
          <Conversation messages={this.state.messages} />
          <MessageInput username={this.state.username} />
          <Modal /> </div>
        <div id="controlBox">
          <ChangePassword />
        </div>
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
    return (<div id="modal">
      <form class="change-password-form" action="change-password" method="POST">
      <div class="form-group">
      <input type="password" id="current-password" placeholder="Enter your current password" name="currentPassword" value={currentPassword} onChange={this.handleChange} class="form-control login-field"/>
      <p></p>
      <input type="password" id="new-password" placeholder="Enter your new password" name="newPassword" value={newPassword} onChange={this.handleChange} class="form-control login-field"/>
      </div>
      <input type="submit" class="btn btn-primary btn-lg btn-block" value="Change password"/>
      </form>
      </div>)
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
      <aside>
        <ul>
          {this.props.username ? <li id="user">{this.props.username}</li> : null}
          {this.props.users.map(renderUser)}
        </ul>
      </aside>
    );
  }
});

// conversation pane
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
      var message = { author: this.props.username, text: this.state.text };
      socket.emit("message", message);
      this.setState({text: ""});
    }
  },
  render: function() {
    return (
      <textarea id="message-input" className="animated"
                placeholder="Write message..." value={this.state.text}
                onChange={this.messageUpdated} onKeyDown={this.handleEnter}/>
    );
  }
});

function scrollChatToBottom() {
  var objDiv = document.getElementById("chat");
  objDiv.scrollTop = objDiv.scrollHeight;
}

var socket = io.connect(window.location.hostname);
React.renderComponent(<Chat />, document.body);