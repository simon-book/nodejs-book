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
            user: "postgres",
            password: "58585858",
            database: "book",
            port: "5432",
            timezone: "Asia/Shanghai",
            schemas: {
                book_publisher: 'book_publisher'
            }
        };
    } else if (environment == "test") {

    } else if (environment == "prod") {

    }

}