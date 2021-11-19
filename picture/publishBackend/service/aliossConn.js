var OSS = require('ali-oss');
var client = new OSS({
    region: __ALIOSS__.region,
    accessKeyId: __ALIOSS__.accessKeyId,
    accessKeySecret: __ALIOSS__.accessKeySecret,
    endpoint: __ALIOSS__.endpoint,
    bucket: __ALIOSS__.bucket
});

module.exports = client;