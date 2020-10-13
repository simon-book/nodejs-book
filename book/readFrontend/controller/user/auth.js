var _ = require('lodash');
var Sequelize = require('sequelize');
var errHandler = require('../../util/errHandler.js');
var util = require('../../util/index.js');
const Op = Sequelize.Op;

var LOGIN_SUCCESS_USER = "login_success_user";

exports.login = login;
// exports.isLogined = isLogined;
exports.getUser = getUser;
exports.logout = logout;

//send login request to platform
function login(req, res, storedAccount) {
    try {
        req.session[LOGIN_SUCCESS_USER] = storedAccount;
        return true;
    } catch (err) {
        return false;
    }
}

//check if session logined 
// function isLogined(req, res) {
//     var user = req.session[LOGIN_SUCCESS_USER]
//     if (user && user.managerId) {
//         return true;
//     }
//     return false;
// }

function logout(req, res) {
    req.session[LOGIN_SUCCESS_USER] = null;
    return true
}

function getUser(req, res) {
    var user = req.session[LOGIN_SUCCESS_USER]
    if (user && user.managerId) {
        return user;
    }
    return null;
}