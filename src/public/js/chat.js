/** @jsx React.DOM */
// main component
var Chat = React.createClass({displayName: 'Chat',
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
      React.createElement("div", null, 
        React.createElement("div", {id: "chat"}, 
          React.createElement(UserList, {username: this.state.username, users: this.state.users}), 
          React.createElement(Conversation, {messages: this.state.messages}), 
          React.createElement(MessageInput, {username: this.state.username}), 
          React.createElement(Modal, null), " "), 
        React.createElement("div", {id: "controlBox"}, 
          React.createElement(ChangePassword, null)
        )
      )
    );
  }
});

var Modal = React.createClass({displayName: 'Modal',
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
    return (React.createElement("div", {id: "modal"}, 
      React.createElement("form", {class: "change-password-form", action: "change-password", method: "POST"}, 
      React.createElement("div", {class: "form-group"}, 
      React.createElement("input", {type: "password", id: "current-password", placeholder: "Enter your current password", name: "currentPassword", value: currentPassword, onChange: this.handleChange, class: "form-control login-field"}), 
      React.createElement("input", {type: "password", id: "new-password", placeholder: "Enter your new password", name: "newPassword", value: newPassword, onChange: this.handleChange, class: "form-control login-field"})
      ), 
      React.createElement("input", {type: "submit", id: "change-password-button", class: "btn btn-primary btn-lg btn-block", value: "Change password"})
      )
      ))
  }
});

var ChangePassword = React.createClass({displayName: 'ChangePassword',
  handleClick: function(e) {
    var elem = document.getElementById("modal");
    elem.style.visibility = "visible";
  },
  render: function() {
    return (React.createElement("button", {onClick: this.handleClick}, "Change password"));
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
      React.createElement("aside", null, 
        React.createElement("ul", null, 
          this.props.username ? React.createElement("li", {id: "user"}, this.props.username) : null, 
          this.props.users.map(renderUser)
        )
      )
    );
  }
});

// conversation pane
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
      socket.emit("message", message);
      this.setState({text: ""});
    }
  },
  render: function() {
    return (
      React.createElement("textarea", {id: "message-input", className: "animated", 
                placeholder: "Write message...", value: this.state.text, 
                onChange: this.messageUpdated, onKeyDown: this.handleEnter})
    );
  }
});

function scrollChatToBottom() {
  var objDiv = document.getElementById("chat");
  objDiv.scrollTop = objDiv.scrollHeight;
}

var socket = io.connect(window.location.hostname);
React.renderComponent(React.createElement(Chat, null), document.body);