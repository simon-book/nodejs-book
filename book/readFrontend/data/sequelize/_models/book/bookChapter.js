var _ = require('lodash');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Branch = require("../branch/branch.js");
var Book = require("./book.js");

var BookChapter = sequelize.define('book_chapter', {
    chapterId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    number: Sequelize.INTEGER,
    title: Sequelize.TEXT,
    cover: Sequelize.TEXT,
    type: Sequelize.INTEGER, //1："text",2:"picture"
    txt: Sequelize.TEXT,
    pics: Sequelize.JSONB, //图片地址数组
    domain: Sequelize.TEXT, //来源域名
    originId: Sequelize.TEXT, //原始复制chapterId
    local: { //是否本地存储，0否，1本地OSS存储，2本地数据库存储；
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    bookId: {
        type: Sequelize.BIGINT,
        references: {
            model: Book,
            key: 'book_id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        allowNull: false
    },
    branchId: {
        type: Sequelize.BIGINT,
        references: {
            model: Branch,
            key: 'branch_id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        allowNull: false
    }
}, {
    schema: __PGSQL__.schemas.book_publisher,
    tableName: 'book_chapter',
    timestamps: false,
    underscored: true,
    indexes: [{
        fields: ['book_id']
    }, {
        fields: ['number']
    }]
});

Book.hasOne(BookChapter, {
    as: "lastChapter",
    foreignKey: "number",
    sourceKey: 'chapterCount'
})

module.exports = BookChapter;