(function() {

})();

var ajaxDo = {
    get: function(url, body, callback, errorCallBack) {
        $.ajax({
            type: 'GET',
            url: url,
            // post payload:
            data: body,
            dataType: 'json',
            timeout: 10000,
            success: function(data) {
                callback ? callback(data) : null;
            },
            error: function(xhr, type) {
                if (xhr.status == 400) errorCallBack ? errorCallBack(JSON.parse(xhr.responseText)) : null;
                else alert("服务错误！")
            }
        })
    },
    post: function(url, body, callback, errorCallBack) {
        $.ajax({
            type: 'POST',
            url: url,
            // post payload:
            data: JSON.stringify(body),
            contentType: 'application/json',
            timeout: 10000,
            success: function(data) {
                callback ? callback(data) : null;
            },
            error: function(xhr, type) {
                if (xhr.status == 400) errorCallBack ? errorCallBack(JSON.parse(xhr.responseText)) : null;
                else alert("服务错误！")
            }
        })
    }
}

function parseLocationSearch() {
    var search = location.search;
    var result = {};
    if (!search) return result;
    search = search.slice(1);
    var searchArray = search.split("&");
    for (var i = 0; i < searchArray.length; i++) {
        var params = searchArray[i].split("=");
        result[params[0]] = params[1];
    }
    return result;
}

function LastRead() {
    this.bookList = "bookList";
    this.set = function(bid, tid, title, texttitle, author, sortname, time) { //保存book阅读记录并更新book列表
        if (!(bid && tid && title && texttitle && author && sortname)) return;
        var v = bid + '#' + tid + '#' + title + '#' + texttitle + '#' + author + '#' + sortname + '#' + time;
        this.setItem(bid, v);
        this.setBook(bid)
    };
    this.get = function(k) { //获取book阅读记录
        return this.getItem(k) ? this.getItem(k).split("#") : "";
    };
    this.remove = function(k) { //将book从阅读记录中删除
        this.removeItem(k);
        this.removeBook(k)
    };
    this.setBook = function(v) {
        // var reg = new RegExp("(^|#)" + v);
        // var reg = new RegExp("#" + v + "#" + "|" + "#" + v + "$");
        // var books = this.getItem(this.bookList);
        // if (books == "") {
        //     books = v
        // } else {
        //     if (books.search(reg) == -1) {
        //         books += "#" + v
        //     } else {
        //         books.replace(reg, "#" + v)
        //     }
        // }
        // this.setItem(this.bookList, books)
        var reg = new RegExp("#" + v + "#");
        var books = this.getItem(this.bookList);
        if (books.search(reg) == -1) {
            if (!books) books = "#";
            books = books + v + "#";
            this.setItem(this.bookList, books)
        }
    };
    this.getBook = function() { //获取阅读记录中的book列表
        var v = this.getItem(this.bookList) ? this.getItem(this.bookList).split("#") : Array();
        var books = Array();
        if (v.length) {
            for (var i = 0; i < v.length; i++) {
                if (!v[i]) continue;
                var tem = this.getItem(v[i]).split('#');
                if (tem.length > 3) books.push(tem);
            }
        }
        return books
    };
    this.removeBook = function(v) {
        var reg = new RegExp("(^|#)" + v);
        var books = this.getItem(this.bookList);
        if (!books) {
            books = ""
        } else {
            if (books.search(reg) != -1) {
                books = books.replace(reg, "")
            }
        }
        this.setItem(this.bookList, books)
    };
    this.setItem = function(k, v) {
        if (!!window.localStorage) {
            localStorage.setItem(k, v);
        } else {
            var expireDate = new Date();
            var EXPIR_MONTH = 365 * 24 * 3600 * 1000;
            expireDate.setTime(expireDate.getTime() + 12 * EXPIR_MONTH)
            document.cookie = k + "=" + escape(v) + ";expires=" + expireDate.toGMTString() + "; path=/";
        }
    };
    this.getItem = function(k) {
        var value = ""
        var result = ""
        if (!!window.localStorage) {
            result = window.localStorage.getItem(k);
            value = result || "";
        } else {
            var reg = new RegExp("(^| )" + k + "=([^;]*)(;|\x24)");
            var result = reg.exec(document.cookie);
            if (result) {
                value = unescape(result[2]) || ""
            }
        }
        return value
    };
    this.removeItem = function(k) {
        if (!!window.localStorage) {
            window.localStorage.removeItem(k);
        } else {
            var expireDate = new Date();
            expireDate.setTime(expireDate.getTime() - 1000)
            document.cookie = k + "= " + ";expires=" + expireDate.toGMTString()
        }
    };
    this.removeAll = function() { //清空阅读记录
        if (!!window.localStorage) {
            window.localStorage.clear();
        } else {
            var v = this.getItem(this.bookList) ? this.getItem(this.bookList).split("#") : Array();
            var books = Array();
            if (v.length) {
                for (i in v) {
                    var tem = this.removeItem(v[k])
                }
            }
            this.removeItem(this.bookList)
        }
    }
}
window.lastread = new LastRead();