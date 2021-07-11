var express = require('express');
var fs = require('fs');
var fsPromises = fs.promises;
var router = express.Router();
var adminHttpResult = require('../util/adminHttpResult.js');
const compressing = require('compressing');
var { compressingAll } = require("./autoSchedule/index.js");

router.get('/compressingAll', async function(req, res) {
    try {
        await compressingAll()
        res.send(true);
    } catch (err) {
        console.log(err);
        res.send(false);
        return;
    }
})

router.get('/get/:branchId/:bookId/:chapterNumber', async function(req, res) {
    try {
        var branchId = req.params.branchId;
        var bookId = req.params.bookId;
        var chapterNumber = req.params.chapterNumber;
        var content = "";
        if (!branchId || !bookId || !chapterNumber) {
            res.send(content);
            return;
        }
        branchId = "branch" + branchId;
        var mossFileName = parseInt((chapterNumber - 1) / 10) * 10 + 1 + "-" + (Math.ceil(chapterNumber / 10) * 10);
        var mossFilePath = branchId + "/" + bookId + "/" + mossFileName;
        if (fs.existsSync("./fileUncompress/" + mossFilePath + "/" + chapterNumber + ".txt")) {
            content = await fsPromises.readFile("./fileUncompress/" + mossFilePath + "/" + chapterNumber + ".txt", {
                encoding: "utf8"
            })
        }
        if (!content && fs.existsSync("./fileCompress/" + mossFilePath + ".zip")) {
            await compressing.zip.uncompress("./fileCompress/" + mossFilePath + ".zip", "./fileUncompress/" + branchId + "/" + bookId);
            if (fs.existsSync("./fileUncompress/" + mossFilePath + "/" + chapterNumber + ".txt")) {
                content = await fsPromises.readFile("./fileUncompress/" + mossFilePath + "/" + chapterNumber + ".txt", {
                    encoding: "utf8"
                })
            }
        }
        res.status(200).send(content);
    } catch (err) {
        console.log(err);
        res.send(content);
        return;
    }
})

router.post('/put/:branchId/:bookId/:chapterNumber', async function(req, res) {
    try {
        var branchId = req.params.branchId;
        var bookId = req.params.bookId;
        var chapterNumber = req.params.chapterNumber;
        var content = req.body.content;
        if (!branchId || !bookId || !chapterNumber || !content) {
            res.send(false);
            return;
        }
        branchId = "branch" + branchId;
        var mossFileName = parseInt((chapterNumber - 1) / 10) * 10 + 1 + "-" + (Math.ceil(chapterNumber / 10) * 10);
        var mossFilePath = branchId + "/" + bookId + "/" + mossFileName;
        if (fs.existsSync("./fileUncompress/" + mossFilePath)) {
            await fsPromises.writeFile("./fileUncompress/" + mossFilePath + "/" + chapterNumber + ".txt", content);
            // if (!fs.existsSync("./fileCompress/" + branchId + "/" + bookId)) {
            //     await fsPromises.mkdir("./fileCompress/" + branchId + "/" + bookId, {
            //         recursive: true
            //     });
            // }
            // await compressing.zip.compressDir("./fileUncompress/" + mossFilePath, "./fileCompress/" + mossFilePath + ".zip");
            res.send(true);
            return;
        } else {
            if (fs.existsSync("./fileCompress/" + mossFilePath + ".zip")) {
                await compressing.zip.uncompress("./fileCompress/" + mossFilePath + ".zip", "./fileUncompress/" + branchId + "/" + bookId);
                if (fs.existsSync("./fileUncompress/" + mossFilePath + "/" + chapterNumber + ".txt")) {
                    res.send(true);
                    return;
                } else {
                    await fsPromises.writeFile("./fileUncompress/" + mossFilePath + "/" + chapterNumber + ".txt", content);
                    res.send(true);
                    return;
                }
            } else {
                await fsPromises.mkdir("./fileUncompress/" + mossFilePath, {
                    recursive: true
                });
                await fsPromises.writeFile("./fileUncompress/" + mossFilePath + "/" + chapterNumber + ".txt", content);
                res.send(true);
                return;
            }
        }
        res.send(true);
    } catch (err) {
        console.log(err);
        res.send(false);
        return;
    }
})

module.exports = router;