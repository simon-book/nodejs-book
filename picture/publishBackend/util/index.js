function generateTokenSalt(len) {
    var saltNums = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
    var sb = [];
    for (var i = 0; i < len; i++) {
        sb.push(saltNums[parseInt(Math.random() * 62)]);
    }
    return sb.join("");
}

function prefixInteger(num, n) {
    return (Array(n).join(0) + num).slice(-n);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}


module.exports = {
    generateTokenSalt,
    prefixInteger,
    sleep
}