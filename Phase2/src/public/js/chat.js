/** @jsx React.DOM */

// main component
var Chat = React.createClass({displayName: 'Chat',
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
      React.DOM.div(null, 
        React.DOM.div({id: "chat"}, 
          UserList({username: this.state.username, users: this.state.users}), 
          Conversation({messages: this.state.messages}), 
          MessageInput({username: this.state.username})
        )
      )
    );
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
    return (React.DOM.aside(null, 
      React.DOM.ul(null, 
        this.props.username ? React.DOM.li({id: "user"}, this.props.username) : null, 
        this.props.users.map(renderUser)
      )
    ));
  }
});

// conversation pane
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
      socket.emit("message", message);
      this.setState({text: ""});
    }
  },
  render: function() {
        return (
        React.DOM.textarea({id: "message-input", 
                  placeholder: "Write message...", value: this.state.text, 
                  onChange: this.messageUpdated, onKeyDown: this.handleEnter, 
                  className: "animated"}
        )
    );
  }
});

function scrollChatToBottom() {
  var objDiv = document.getElementById("chat");
  objDiv.scrollTop = objDiv.scrollHeight;
}

var socket = io.connect(window.location.hostname);
React.renderComponent(Chat(null), document.body);
