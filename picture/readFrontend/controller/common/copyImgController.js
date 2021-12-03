var _ = require('lodash');
var fs = require('fs');
var fsPromises = fs.promises;
var moment = require('moment');
var http = require('https');
var sharp = require('sharp');
var overlayImg = null;
async function startDownloadFile(host, path, fileName) {
    try {
        if (!overlayImg) overlayImg = await fsPromises.readFile('./static/dsrc/images/9iktb.jpg');
        var result = await downloadFile(host, path, fileName);
        if (!result) {
            var result = await downloadFile(host, path, fileName);
        }
        if (!result) {
            var result = await downloadFile(host, path, fileName);
        }
        if (!result) {
            var result = await downloadFile(host, path, fileName);
        }
        if (!result) {
            var result = await downloadFile(host, path, fileName);
        }
        if (result) {
            return true;
        } else throw new Error("5次请求img失败");
    } catch (err) {
        console.log("5次请求img失败:", host, path, fileName);
        return false;
    }
}

async function downloadFile(host, path, fileName) {
    try {
        await httpFile(host, path, fileName);
        return true;
    } catch (err) {
        return false;
    }
}


function httpFile(host, path, fileName) {
    return new Promise(function(resolve, reject) {
        // var stream = fs.createWriteStream(fileName);
        // stream.on('finish', async () => {
        //     console.log("download!", fileName);
        //     resolve(true);
        // });
        console.log("start download!", host, path, fileName);
        var req = http.request({
            host: host,
            // port: "85",
            path: path,
            method: 'GET',
            headers: {
                "Referer": "https://www.da12.cc/"
            },
            timeout: 10000
        }, function(res) {
            // response.pipe(stream);
            var _data = [];
            res.on('data', function(chunk) {
                _data.push(chunk);
            });
            res.on('end', async function() {
                if (res.statusCode == 200) {
                    try {
                        var body = Buffer.concat(_data);
                        var image = await sharp(body);
                        var metadata = await image.metadata();
                        image.composite([{ input: overlayImg, top: metadata.height - 32, left: metadata.width - 132 }]).toFile(fileName).then(function() {
                            resolve(true);
                        });
                    } catch (err) {
                        console.log(path, err);
                        reject(err);
                    }
                } else {
                    reject("status error");
                }
            });

        });
        req.on('error', function(e) {
            console.log("error", e);
            reject();
        });
        req.on('timeout', function(e) {
            req.abort();
            console.log("timeout", e);
            reject(e);
        });
        req.write("");
        req.end();
    })
}

exports.startDownloadFile = startDownloadFile;
exports.downloadFile = downloadFile;
exports.httpFile = httpFile;