var helper = {};
exports.helper = helper;

var _ = require('lodash');
var log4js = require('log4js');
var fs = require("fs");
var path = require("path");

// 加载配置文件  
var objConfig = JSON.parse(fs.readFileSync("./log4js/log4js.json", "utf8"));

// 检查配置文件所需的目录是否存在，不存在时创建  
if (objConfig.appenders) {
    var baseDir = __G__.LOG_BASE_DIR;
    var defaultAtt = objConfig["customDefaultAtt"];

    for (var i = 0, j = objConfig.appenders.length; i < j; i++) {
        var item = objConfig.appenders[i];
        if (item["type"] == "console")
            continue;

        if (defaultAtt != null) {
            for (var att in defaultAtt) {
                if (item[att] == null)
                    item[att] = defaultAtt[att];
            }
        }
        if (baseDir != null) {
            if (item["filename"] == null)
                item["filename"] = baseDir;
            else
                item["filename"] = baseDir + item["filename"];
        }
        var fileName = item["filename"];
        if (fileName == null)
            continue;
        var pattern = item["pattern"];
        if (pattern != null) {
            fileName += pattern;
        }
        var category = item["category"];
        console.log(fileName);
        // if (!isAbsoluteDir(fileName)) //path.isAbsolute(fileName))  
        //     throw new Error("配置节" + category + "的路径不是绝对路径:" + fileName);
        var dir = path.dirname(fileName);
        console.log(__dirname, dir);
        checkAndCreateDir(dir);
    }
}

// 目录创建完毕，才加载配置，不然会出异常  
log4js.configure(objConfig);

var logDebug = log4js.getLogger('logDebug');
var logInfo = log4js.getLogger('logInfo');
var logWarn = log4js.getLogger('logWarn');
var logErr = log4js.getLogger('logErr');

helper.writeDebug = function(msgs) {
    var msg = "";
    if (msgs instanceof Array) {
        _.forEach(msgs, function(exp) {
            if (exp != null)
                msg += "\r\n" + exp;
        })
    } else msg += msgs;
    logDebug.debug(msg);
};

helper.writeInfo = function(msgs) {
    var msg = "";
    if (msgs instanceof Array) {
        _.forEach(msgs, function(exp) {
            if (exp != null)
                msg += "\r\n" + exp;
        })
    } else msg += msgs;
    logInfo.info(msg);
};

helper.writeWarn = function(msgs) {
    var msg = "";
    if (msgs instanceof Array) {
        _.forEach(msgs, function(exp) {
            if (exp != null)
                msg += "\r\n" + exp;
        })
    } else msg += msgs;
    logWarn.warn(msg);
};

helper.writeErr = function(msgs) {
    var msg = "";
    if (msgs instanceof Array) {
        _.forEach(msgs, function(exp) {
            if (exp != null)
                msg += "\r\n" + exp;
        })
    } else msg += msgs;
    logErr.error(msg);
};

// 配合express用的方法  
exports.use = function(app) {
    //页面请求日志, level用auto时,默认级别是WARN  
    app.use(log4js.connectLogger(logInfo, {
        level: 'debug',
        format: ':method :url'
    }));
}

// 判断日志目录是否存在，不存在时创建日志目录  
function checkAndCreateDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

// 指定的字符串是否绝对路径  
function isAbsoluteDir(path) {
    if (path == null)
        return false;
    var len = path.length;

    var isWindows = process.platform === 'win32';
    if (isWindows) {
        if (len <= 1)
            return false;
        return path[1] == ":";
    } else {
        if (len <= 0)
            return false;
        return path[0] == "/";
    }
}