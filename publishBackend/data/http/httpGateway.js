var request = require('request')

exports.htmlStartReq = function(uri) {
    return new Promise(function(resolve, reject) {
        request({
            uri: uri,
            method: 'GET'
        }, (err, response, body) => {
            if (err) {
                console.log(err)
            }
            resolve(body)
        })
    })
}