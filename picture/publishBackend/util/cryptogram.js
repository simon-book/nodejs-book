var crypto = require('crypto');

var key = 'xfg93jtd54fgmz0p';
var iv = "i0pzxcmnt2rwk358";
key = Buffer.from(key);
iv = Buffer.from(iv);

/**
 * aes加密
 * @param data
 */
function aesEncrypt(data) {
    var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    var encoded = cipher.update(data, 'utf8', 'hex');
    encoded += cipher.final('hex');
    return encoded;
}

/**
 * aes解密
 * @param data
 * @returns {*}
 */
function aesDecrypt(data) {
    var cipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    var decoded = cipher.update(data, 'hex', 'utf8');
    decoded += cipher.final('utf8');
    return decoded;
}

//md5加密
function md5Encrypt(data) {
    var md5 = crypto.createHash('md5');
    md5.update(data);
    var d = md5.digest('hex');
    return d;
}


//sha1加密
function sha1Encrypt(data) {
    var sha1 = crypto.createHash('sha1');
    sha1.update(data);
    var d = sha1.digest('hex');
    return d;
}


function hmacEncrypt(data, key) {
    var hmac = crypto.createHmac('md5', key);
    hmac.update(data);
    var d = hmac.digest('hex');
    return d;
}


exports.aesEncrypt = aesEncrypt;
exports.aesDecrypt = aesDecrypt;
exports.md5Encrypt = md5Encrypt;
exports.sha1Encrypt = sha1Encrypt;
exports.hmacEncrypt = hmacEncrypt;