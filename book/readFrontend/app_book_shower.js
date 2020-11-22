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
var branchMap = require('./controller/common/branchMap.js');

process.env.NODE_ENV = __G__.NODE_ENV;

var app = express();
// all environments
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');
app.set('view options');
app.use(favicon(path.join(__dirname, 'static/src/images/favicon.ico')));
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
        maxAge: 360 * 24 * 60 * 60 * 1000
    }
}));
app.use('*', function(req, res, next) {
    console.log(req.baseUrl, req.method, req.body);
    next();
})

app.use(__G__.CONTEXT + "/static", express.static(path.join(__dirname, '/static'), {
    maxAge: '1d'
}));
app.use(__G__.CONTEXT + "/html", express.static(path.join(__dirname, '/html')));

app.use(__G__.CONTEXT || '/', require('./controller/pageRoutes.js'));

branchMap.queryBranchInfo();

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        title: "出错了",
        keywords: "出错了",
        description: "出错了",
        message: err.message,
        error: {}
    });
});
app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});