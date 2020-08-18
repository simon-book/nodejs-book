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
            reader_api: {
                protocol: "http:",
                host: "localhost",
                port: "3900"
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
            user: "postgres",
            password: "58585858",
            database: "book_platform",
            port: "5432",
            timezone: "Asia/Shanghai",
            schemas: {
                book_publisher: 'book_publisher',
                book_reader: 'book_reader',
                book_shower: 'book_shower',
            }
        };
        global.__HOSTMAP__ = {
            "localhost": {
                branchId: 1,
                title: "测试",
                keywords: "闪舞小说网,35xs",
                description: "闪舞小说网致力于打造小说最全，更新最快的在线小说阅读网。"
            },
        };
    } else if (environment == "test") {

    } else if (environment == "prod") {

    }

}