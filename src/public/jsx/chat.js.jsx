/** @jsx React.DOM */

// main component
var Chat = React.createClass({
  getInitialState: function() {
    return {
      username: null,
      users: [],
      ip: null,
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
    // since server emits a join when this user joins,
    // we have to ignore for that case
    if (this.state.username != user) {
      this.setState({users: this.state.users.concat([user])});
    }
    scrollChatToBottom();
  },
  userQuit: function(user) {
    var newUsers = this.state.users.slice();
    newUsers.splice(newUsers.indexOf(user));
    this.setState({users:newUsers});
    scrollChatToBottom();
  },
  render: function() {
    return (
      <div>
        <div id="chat">
          <UserList username={this.state.username} users={this.state.users} />
          <Conversation messages={this.state.messages} />
          <MessageInput username={this.state.username} />
        </div>
      </div>
    );
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
    return (<aside>
      <ul>
        {this.props.username ? <li id="user">{this.props.username}</li> : null}
        {this.props.users.map(renderUser)}
      </ul>
    </aside>);
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
        <textarea id="message-input"
                  placeholder="Write message..." value={this.state.text}
                  onChange={this.messageUpdated} onKeyDown={this.handleEnter}
                  className="animated"
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
