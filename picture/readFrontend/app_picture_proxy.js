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
var compression = require('compression');

var app = express();
// all environments
app.set('port', process.env.PORT || 4444);
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use(compression());
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

app.use('/', require('./controller/imgHttpRoutes.js'));

app.use(function(err, req, res, next) {
    res.status(404).send("您访问的资源不存在！");
});
app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});