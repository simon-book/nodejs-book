var cryptogram = require("./cryptogram.js");

var saltChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
var saltNums = "0123456789ABCDEF".split("");

function generateNumSalt(len) {
  var sb = [];
  for (var i = 0; i < len; i++) {
    sb.push(saltNums[parseInt(Math.random() * 16)]);
  }
  return sb.join("");
}

function pwdEncrypt(username, password, brandSn, salt) {
  var salt = salt || generateNumSalt(8);
  var sha1Pass = cryptogram.sha1Encrypt(password);
  var sha1All = cryptogram.sha1Encrypt(username + salt + brandSn + salt + sha1Pass);
  return [salt, sha1All];
}

function pwdValidate(username, password, brandSn, salt, storePwd) {
  var sha1All = pwdEncrypt(username, password, brandSn, salt);
  return sha1All[1] == storePwd;
}


exports.pwdEncrypt = pwdEncrypt;
exports.pwdValidate = pwdValidate;