(function() {

})();

var cookieDo = {
    setCookie: function(c_name, value, expiredays) {
        var exdate = new Date()
        exdate.setDate(exdate.getDate() + 365)
        document.cookie = c_name + "=" + escape(value) + ";expires=" + exdate.toGMTString() + ";path=/";
    },
    getCookie: function(c_name) {
        if (document.cookie.length > 0) {
            c_start = document.cookie.indexOf(c_name + "=");
            if (c_start != -1) {
                c_start = c_start + c_name.length + 1;
                c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1) c_end = document.cookie.length;
                return unescape(document.cookie.substring(c_start, c_end));
            }
        }
        return "";
    },
    delCookie: function(name) {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval = getCookie(name);
        document.cookie = name + "=;expires=" + exp.toGMTString();
    }
}

var ajaxDo = {
    get: function(url, body, callback) {
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
                alert('请求出错!')
            }
        })
    },
    post: function(url, body, callback) {
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
                alert('请求出错!')
            }
        })
    }
}