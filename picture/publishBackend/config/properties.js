/**
 * Project properties
 * @Author  Simon
 * @Date    2014-04-18
 */

var environment = "dev";
// var environment = "test";
// var environment = "prod";

module.exports = function() {
    if (environment == "dev") {
        global.__plat__ = {

        };
        global.__G__ = {
            SEESION_TIMEOUT: 1209600000, //14day*24*60*60
            CONTEXT: '',
            LOG_BASE_DIR: './logs/', //日志目录
            VERSION: '20200407001',
            NODE_ENV: 'development' //values: development, deploy
        };
        global.__PGSQL__ = {
            host: "localhost",
            user: "mac",
            // password: "",
            database: "mac",
            port: "5432",
            timezone: "Asia/Shanghai",
            schemas: {
                picture_publisher: 'picture_publisher'
            }
        };
        global.__ALIOSS__ = {
            region: 'oss-cn-hangzhou',
            accessKeyId: 'LTAI5tLCE9zGUoRTD8JupGn4',
            accessKeySecret: 'L2fuo6Polz53eoYuZ8Juz7IOSEPSLM',
            bucket: '99nvshen',
            endpoint: 'oss-cn-hangzhou.aliyuncs.com'
        };
        global.__MOSS__ = {
            endPoint: "127.0.0.1",
            port: 9000,
            useSSL: false,
            accessKey: "minioadmin",
            secretKey: "minioadmin"
        };
    } else if (environment == "test") {

    } else if (environment == "prod") {
        global.__plat__ = {

        };
        global.__G__ = {
            SEESION_TIMEOUT: 1209600000, //14day*24*60*60
            CONTEXT: '',
            LOG_BASE_DIR: './logs/', //日志目录
            VERSION: '20200407001',
            NODE_ENV: 'deploy' //values: development, deploy
        };
        global.__PGSQL__ = {
            host: "localhost",
            user: "amn",
            password: "amn",
            database: "amn",
            port: "5432",
            timezone: "Asia/Shanghai",
            schemas: {
                picture_publisher: 'picture_publisher'
            }
        };
        global.__ALIOSS__ = {
            region: 'oss-cn-hangzhou',
            accessKeyId: 'LTAI5tLCE9zGUoRTD8JupGn4',
            accessKeySecret: 'L2fuo6Polz53eoYuZ8Juz7IOSEPSLM',
            bucket: '99nvshen',
            endpoint: 'oss-cn-hangzhou-internal.aliyuncs.com'
        };
        global.__MOSS__ = {
            endPoint: "127.0.0.1",
            port: 9000,
            useSSL: false,
            accessKey: "minioadmin",
            secretKey: "Chyb1234"
        };
    }

}