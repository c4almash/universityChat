$(function () {
  var message = unescape(getCookie('alert'));
  if (!message.trim()) return;

  function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
  }

  function eraseCookie(name) {
    document.cookie = name + "=;";
  }

  $("#landing").prepend($('<div/>', {'class': 'alert alert-info',
                                     role: 'alert', text: message}));
  eraseCookie('alert');
});
