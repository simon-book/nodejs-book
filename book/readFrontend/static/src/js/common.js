function login() {
    var username = $('.login_nm').val();
    var password = $('.login_psw').val();
    if (!username || !password) {
        alert("请输入用户名和密码！");
        return;
    }
    ajaxDo.post("/login", { username: username, password: password }, function(data) {
        debugger;
    })
}