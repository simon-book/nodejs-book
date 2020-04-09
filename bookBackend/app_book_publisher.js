/**
 * book server 
 * @Author: Simon
 * @Date:   2020-4-7  
 */

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var cookieParser = require('cookie-parser');
// var cookieSession = require('cookie-session');
var session = require('express-session');
var bodyParser = require('body-parser');
var properties = require('./config/properties.js')();

process.env.NODE_ENV = __G__.NODE_ENV;

var app = express();
// all environments
app.set('port', process.env.PORT || 3305);
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');
app.set('view options');
app.use(favicon(path.join(__dirname, 'statics/src/images/favicon.ico')));
//app.use(express.logger('dev'));
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use(cookieParser('IB_Ck!'));
// app.use(cookieSession({secret: 'IB_Ss!'}));
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

//app.use(i18n.init);

app.use(__G__.CONTEXT + "/static", express.static(path.join(__dirname, '/statics')));
app.use(__G__.CONTEXT + "/html", express.static(path.join(__dirname, '/html')));

app.use(__G__.CONTEXT || '/shuyu', require('./controller/index.js'));
app.use(__G__.CONTEXT || '/shuyu/book', require('./controller/bookHttpRoutes.js'));



// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

//conn.connect(function(err) {
//    if (err) throw err;
//    console.log("Connected!");
//});