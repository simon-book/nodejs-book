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

process.env.NODE_ENV = __G__.NODE_ENV;

var app = express();
// all environments
app.set('port', process.env.PORT || 3800);
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


app.use(__G__.CONTEXT + "/static", express.static(path.join(__dirname, '/statics')));
app.use(__G__.CONTEXT + "/html", express.static(path.join(__dirname, '/html')));

app.use(__G__.CONTEXT || '/api/publisher', require('./controller/index.js'));


app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send(err);
});
app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});