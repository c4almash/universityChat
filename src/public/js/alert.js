// requires cookie.js

$(function () {
  var message = unescape(getCookie('alert'));
  if (!message.trim()) return;

  if (message && message != "null") {
    $("#landing").prepend($('<div/>', {'class': 'alert alert-info',
                                     role: 'alert', text: message}));
  }
  eraseCookie('alert');
});
