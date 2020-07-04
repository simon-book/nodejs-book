var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var cheerio = require('cheerio');
var httpGateway = require('../../data/http/httpGateway.js')
var branchMap = require('./commonController.js').branchMap

//抓取m.35xs.co的小说
exports.copy_35xiaoshuo_book = async function() {
    try {
        var branch = branchMap["m.35xs.co"];
        var uri = branch.copyUrl + "/Book/List?page=1";
        var html = await httpGateway.htmlStartReq(uri);
        var $ = cheerio.load(html);
        var targetItems = $("#main").children(".hot_sale");
        var books = [];
        for (var i = 0; i < targetItems.length; i++) {
            var item = targetItems[i];
            var bookImg = $(item).find("img.lazy").attr("data-original");
            var bookTitle = $(item).find("p.title").text();
            var bookAuthor = $(item).find("p.author").text();
            var bookDesc = $(item).find("p.review").text().slice(3);
            var bookHref = branch.copyUrl + $(item).find("a").attr("href");
            var bookScore = parseInt($(item).find(".score").text()) * 2;
            // console.log(bookTitle, bookAuthor, bookDesc, bookImg, bookHref, bookScore);
            var book = {
                title: bookTitle,
                author: bookAuthor,
                desc: bookDesc,
                img: bookImg,
                href: bookHref,
                score: bookScore,
                muluHref: bookHref + "mulu/",
                mulu: []
            }
            var bookHtml = await httpGateway.htmlStartReq(book.href);
            var $ = cheerio.load(bookHtml);
            var sort = $(".sort");
            book.sort = sort.text().slice(3);
            var nexts = sort.nextAll("li");
            book.published = $(nexts[0]).text().slice(3);
            book.updatedAt = $(nexts[1]).text().slice(3);

            var muluHtml = await httpGateway.htmlStartReq(book.muluHref);
            var $ = cheerio.load(muluHtml);
            var chapters = $("#chapterlist").children();
            for (var j = 1; j < chapters.length; j++) {
                var a = $(chapters[j]).children()[0];
                book.mulu.push({
                    title: $(a).text(),
                    number: j,
                    href: branch.copyUrl + $(a).attr("href")
                });
            }
            console.log(book);
            books.push(book);
        }
    } catch (err) {
        console.log(err);
    }
}