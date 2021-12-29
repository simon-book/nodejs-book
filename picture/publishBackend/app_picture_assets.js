/**
 * book server 
 * @Author: Simon
 * @Date:   2020-4-7  
 */

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var properties = require('./config/properties.js')();

__G__.copySrc = "fnvshen";
process.env.NODE_ENV = __G__.NODE_ENV;

var app = express();
// all environments
app.set('port', process.env.PORT || 4801);
app.set('views', path.join(__dirname, 'templates/stat'));
app.set('view engine', 'ejs');
app.set('view options');
app.use(favicon(path.join(__dirname, 'statics/src/images/favicon.ico')));
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use(cookieParser('IB_Ck!'));
app.use(session({
    name: 'book_sid',
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 120 * 60 * 1000
    }
}));
app.set('jsonp callback name', 'onJsonpLoad');

app.use('*', function(req, res, next) {
    console.log(req.baseUrl, req.method, req.body, req.session && req.session["login_success_user"] ? (req.session["login_success_user"].id + " - " + req.session["login_success_user"].phone) : null);
    next();
})

app.use(__G__.CONTEXT + "/assets", express.static(path.join(__dirname, '/assets')));

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send(err);
});
app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});