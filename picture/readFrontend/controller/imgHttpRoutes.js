var express = require('express');
var router = express.Router();
var moment = require('moment');
var path = require('path');
var fs = require('fs');
var fsPromises = fs.promises;
var crytogram = require('../util/cryptogram.js')
var copyImgController = require('./common/copyImgController.js');

router.get('/kuku/*', async function(req, res) {
    try {
        var filePath = "./proxy/";
        var imgUrl = req.originalUrl;
        var imgFormat = imgUrl.split(".").pop();
        var md5Name = crytogram.md5Encrypt(imgUrl);
        filePath = filePath + md5Name.slice(0, 2);
        var fileName = filePath + "/" + md5Name + "." + imgFormat;
        if (fs.existsSync(fileName)) {
            res.sendFile(fileName, {
                root: path.resolve(),
                headers: {
                    "Expires": new Date(new Date().getTime() + 2592000000),
                    "Cache-Control": "max-age=2592000"
                },
                cacheControl: true
            });
            return true;
        }
        if (!fs.existsSync(filePath)) {
            await fsPromises.mkdir(filePath, {
                recursive: true
            });
        }
        var result = await copyImgController.startDownloadFile("pic.da12.cc", imgUrl, fileName);
        res.sendFile(fileName, {
            root: path.resolve(),
            headers: {
                "Expires": new Date(new Date().getTime() + 2592000000),
                "Cache-Control": "max-age=2592000"
            },
            cacheControl: true
        });
    } catch (err) {
        console.log(err);
        res.status(404).end()
    }
});
console.log(__dirname);
console.log(path.resolve());
module.exports = router;