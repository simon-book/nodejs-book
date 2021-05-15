var locationSearch = parseLocationSearch();
var goto_register = $('#goto_register');
if (location.search) goto_register.attr("href", goto_register.attr("href") + location.search);

function register() {
    var username = $('#username').val();
    var password = $('#userpass').val();
    var repassword = $('#userpassqr').val();
    if (!username) {
        alert("请输入用户名！");
        return;
    }
    if (!password) {
        alert("请输入密码！");
        return;
    }
    if (!repassword) {
        alert("请再次输入密码！");
        return;
    }
    if (password != repassword) {
        alert("两次输入的密码不一致！");
        return;
    }
    ajaxDo.post("/register", { username: username, password: password }, function(data) {
        alert("注册成功！")
        if (locationSearch.o) location.href = locationSearch.o;
        else location.href = "/"
    }, function(err) {
        if (err.rtnMsg) alert(err.rtnMsg);
    })
}

function login() {
    var username = $('#username').val();
    var password = $('#password').val();
    if (!username || !password) {
        alert("请输入用户名和密码！");
        return;
    }
    ajaxDo.post("/login", { username: username, password: password }, function(data) {
        if (locationSearch.o) location.href = locationSearch.o;
        else location.href = "/"
    }, function(err) {
        if (err.rtnMsg) alert(err.rtnMsg);
    })
}

function smallLogin() {
    var username = $('#small-username').val();
    var password = $('#small-password').val();
    if (!username || !password) {
        alert("请输入用户名和密码！");
        return;
    }
    ajaxDo.post("/login", { username: username, password: password }, function(data) {
        // if (locationSearch.o) location.href = locationSearch.o;
        // else location.href = "/"
        location.reload();
    }, function(err) {
        if (err.rtnMsg) alert(err.rtnMsg);
    })
}