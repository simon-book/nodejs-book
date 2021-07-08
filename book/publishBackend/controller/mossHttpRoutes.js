var express = require('express');
var fs = require('fs');
var router = express.Router();
const compressing = require('compressing');

var MossClient = require('../service/mossConn.js');

// function UncompressStream(stream) {
//     return new compressing.zip.UncompressStream({
//         source: stream
//     });
// }

router.post('/put', async function(req, res) {
    try {
        var bookId = req.body.bookId;
        var chapterNumber = req.body.chapterNumber;
        var mossFileName = parseInt((chapterNumber - 1) / 10) * 10 + 1 + "-" + (Math.ceil(chapterNumber / 10) * 10);
        var savedFile = await MossClient.getStream("test", bookId + "/" + mossFileName + ".zip");

        const zipStream = new compressing.zip.Stream();
        if (savedFile) {
            await compressing.zip.uncompress(savedFile, "./file/" + bookId);
            zipStream.addEntry("./file/" + bookId + "/" + mossFileName, {
                relativePath: "./"
            });
        }
        const buf1 = Buffer.from(req.body.content);
        zipStream.addEntry(buf1, {
            relativePath: "./" + mossFileName + "/" + chapterNumber
        });
        var result = await MossClient.put("test", bookId + "/" + mossFileName + ".zip", zipStream);
        res.send(result);
    } catch (err) {
        console.log(err);
    }

})

router.post('/get', async function(req, res) {
    var bookId = req.body.bookId;
    var chapterNumber = req.body.chapterNumber;
    var mossFileName = parseInt((chapterNumber - 1) / 10) * 10 + 1 + "-" + (Math.ceil(chapterNumber / 10) * 10);
    if (fs.existsSync("./file1/" + bookId + "/" + mossFileName + "/" + chapterNumber)) {
        var content = fs.readFileSync("./file1/" + bookId + "/" + mossFileName + "/" + chapterNumber)
        res.send(content);
        return;
    }
    var savedFile = await MossClient.getStream("test", bookId + "/" + mossFileName + ".zip");
    if (savedFile) {
        await compressing.zip.uncompress(savedFile, "./file1/" + bookId);
        if (fs.existsSync("./file1/" + bookId + "/" + mossFileName + "/" + chapterNumber)) {
            var content = fs.readFileSync("./file1/" + bookId + "/" + mossFileName + "/" + chapterNumber)
            res.send(content);
            return;
        }
    }
    res.send(false);
})

router.post('/listObjects', async function(req, res) {
    var result = await MossClient.listObjects(req.body.bucketName, req.body.prefix, req.body.recursive);
    res.send(result);
})

module.exports = router;