/**
 *  Responsible for data communication between platforms and applications
 *  @Author: Sid
 *  @Date: 2014-04-18
 */

var http = require('http');
var https = require('https');

CPlatServer = function(options) {
    this.options = {
        protocol: options.protocol,
        host: options.host,
        port: options.port,
        path: options.path,
        method: options.method || 'POST',
        headers: options.headers || {
            "Content-Type": "application/json; charset=utf-8"
        },
        timeout: options.timeout || 5000
    };
    //callback queue
    this.callbackQueue = {
        "completed": [],
        "error": []
    };
    //request queue
    this.requestIndex = 0;
    this.requestQueue = [];
};

CPlatServer.prototype = {
    setOptions: function(opts) {
        this.options = _.assign(this.options, opts);
    },
    setPath: function(path) {
        this.options.path = path;
    },
    insertHeader: function(key, value) {
        this.options.headers[key] = value;
    },
    request: function(body) {
        var _self = this;
        var _index = _self.requestIndex;
        var _http = null;
        if (_self.options.protocol == "https:") _http = https;
        else _http = http;
        delete _self.options.protocol;
        var req = _http.request(_self.options, function(res) {
            var _data = '';
            res.on('data', function(chunk) {
                _data += chunk;
            });
            res.on('end', function() {
                if (res.statusCode == 200)
                    _self.fire.call(_self, "completed", _data, _index);
                else
                    _self.fire.call(_self, "error", _data, _index);
            });

        });
        req.on('error', function(e) {
            _self.fire.call(_self, "error", e, _index);
        });
        req.on('timeout', function(e) {
            req.abort();
            _self.fire.call(_self, "error", e, _index);
        });
        body = typeof body === 'object' ? JSON.stringify(body) : body;
        req.write(body);
        req.end();
        _self.requestQueue.push({
            "req": req,
            "data": null
        });
        _self.requestIndex++;
        return _self;
    },
    completed: function(callback) {
        if (!callback || typeof callback !== 'function') return this;
        this.callbackQueue['completed'].push(callback);
        return this;
    },
    error: function(callback) {
        if (!callback || typeof callback !== 'function') return this;
        this.callbackQueue['error'].push(callback);
        return this;
    },
    fire: function(event, result, index) {
        var _data;
        // result = JSON.parse(result);
        if (result && event == "completed") result = JSON.parse(result);
        this.requestQueue[index].data = result;
        //If have multiple requests
        if (this.requestIndex > 1) {
            var done = true;
            _data = [];
            for (var i = 0, reqs = this.requestQueue; i < this.requestQueue.length; i++) {
                if (reqs[i].data == null) {
                    done = false;
                } else {
                    _data.push(reqs[i].data);
                }
            }
            //Must all the requests are completed, if not the callback function is not invoked
            if (done == false) {
                return;
            }
        } else {
            _data = result;
        }

        if (this.callbackQueue[event].length == 1) {
            this.callbackQueue[event][0](_data);
            this.callbackQueue[event] = [];
            return;
        }
        if (this.callbackQueue[event].length > 0) {
            for (var i = 0, callbacks = this.callbackQueue[event]; i < callbacks.length; i++) {
                callbacks[i](_data);
            }
            //empt the callbackQueue
            this.callbackQueue[event] = [];
        }
    }
};


module.exports = CPlatServer;