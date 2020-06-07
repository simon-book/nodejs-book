exports.home = async function(req, res) {
    res.render('home', { title: "测试" });
};

exports.category = async function(req, res) {
    res.render('category', { title: "测试" });
};

exports.quanben = async function(req, res) {
    res.render('quanben', { title: "测试" });
};

exports.history = async function(req, res) {
    res.render('history', { title: "测试" });
};

exports.book = async function(req, res) {
    res.render('book', { title: "测试" });
};

exports.chapter = async function(req, res) {
    res.render('chapter', { title: "测试" });
};

exports.search = async function(req, res) {
    res.render('search', { title: "测试" });
};

exports.register = async function(req, res) {
    res.render('register', { title: "测试" });
};

exports.login = async function(req, res) {
    res.render('login', { title: "测试" });
};