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
            mossServer: {
                protocol: "http:",
                host: "localhost",
                port: "3600"
            }
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
            password: "",
            database: "mac",
            port: "5432",
            timezone: "Asia/Shanghai",
            schemas: {
                picture_publisher: 'picture_publisher'
            }
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
            mossServer: {
                protocol: "http:",
                host: "localhost",
                port: "3600"
            }
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
        global.__MOSS__ = {
            endPoint: "127.0.0.1",
            port: 9000,
            useSSL: false,
            accessKey: "minioadmin",
            secretKey: "Chyb1234"
        };
    }

}