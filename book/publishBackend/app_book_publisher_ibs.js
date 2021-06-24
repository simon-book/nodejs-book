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
var auto_schedule = require('./controller/autoSchedule/index.js');

process.env.NODE_ENV = __G__.NODE_ENV;

var app = express();
// all environments
app.set('port', process.env.PORT || 3803);
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

app.use(__G__.CONTEXT || '/api/publisher/ibs', require('./controller/ibsHttpRoutes.js'));

auto_schedule.auto_schedule_ibs();

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send(err);
});
app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});