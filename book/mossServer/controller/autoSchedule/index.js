var _ = require('lodash');
var fs = require('fs');
var fsPromises = fs.promises;
var schedule = require('node-schedule');
var moment = require('moment');
const compressing = require('compressing');

exports.auto_schedule_biqu = function() {
    schedule.scheduleJob('0 0 16 * * *', async function() {
        await compressingAll();
    });
}

async function compressingAll() {
    var branches = await fsPromises.readdir("./fileUncompress/");
    console.log(branches);
    if (!branches || !branches.length) return false;
    for (var i = 0; i < branches.length; i++) {
        var branch = branches[i];
        if (!fs.existsSync("./fileUncompress/" + branch + "/")) continue;
        var books = await fsPromises.readdir("./fileUncompress/" + branch + "/");
        console.log(books);
        if (!books || !books.length) continue;
        for (var j = 0; j < books.length; j++) {
            var book = books[j];
            if (!fs.existsSync("./fileUncompress/" + branch + "/" + book + "/")) continue;
            var chapterGroups = await fsPromises.readdir("./fileUncompress/" + branch + "/" + book + "/");
            console.log(chapterGroups);
            if (!chapterGroups || !chapterGroups.length) continue;
            for (var m = 0; m < chapterGroups.length; m++) {
                var chapterGroup = chapterGroups[m];
                if (!fs.existsSync("./fileUncompress/" + branch + "/" + book + "/" + chapterGroup + "/")) continue;
                if (!fs.existsSync("./fileCompress/" + branch + "/" + book)) {
                    await fsPromises.mkdir("./fileCompress/" + branch + "/" + book, {
                        recursive: true
                    });
                }
                await compressing.zip.compressDir("./fileUncompress/" + branch + "/" + book + "/" + chapterGroup, "./fileCompress/" + branch + "/" + book + "/" + chapterGroup + ".zip");
            }
        }
    }
}

exports.compressingAll = compressingAll;