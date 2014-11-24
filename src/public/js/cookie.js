// global cookie helper function

function eraseCookie(name) {
  document.cookie = name + "=;";
}

function getCookie(key) {
  var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
  return keyValue ? keyValue[2] : null;
}
