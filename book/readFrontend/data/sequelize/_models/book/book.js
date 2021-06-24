var _ = require('lodash');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Branch = require("../branch/branch.js");
var BookCategory = require("./bookCategory.js");
var BookChapter = require("./bookChapter.js");

var Book = sequelize.define('book', {
    bookId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    title: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    sn: Sequelize.TEXT, //编码
    // keywords: Sequelize.TEXT,
    writer: Sequelize.TEXT,
    cover: Sequelize.TEXT, //竖向封面
    horiCover: Sequelize.TEXT, //横向封面
    abstractContent: Sequelize.TEXT, //摘要
    chapterCount: Sequelize.INTEGER, //章节数
    recommend: Sequelize.INTEGER, //推荐指数
    readCount: Sequelize.INTEGER, //阅读数
    lastChapterId: {
        type: Sequelize.BIGINT,
        references: {
            model: BookChapter,
            key: 'chapter_id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        allowNull: true
    },
    categoryId: { //主分类
        type: Sequelize.BIGINT,
        references: {
            model: BookCategory,
            key: 'category_id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        allowNull: false
    },
    categoryName: Sequelize.TEXT, //分类名称
    bookType: { //1:"novel", 2:"cartoon", 3:"photo", 4:"video"
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    publishStatus: Sequelize.INTEGER, //1:"serialize", 2:"finish"
    lastUpdatedAt: Sequelize.DATE, //最近更新时间
    copyInfo: Sequelize.JSONB, //复制来源相关信息
    originId: Sequelize.TEXT, //复制原始ID
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
    tableName: 'book',
    timestamps: true,
    underscored: true,
    indexes: [{
        fields: ['branch_id']
    }, {
        fields: ['title']
    }, {
        fields: ['writer']
    }, {
        fields: ['last_updated_at']
    }, {
        fields: ['origin_id']
    }, {
        fields: ['category_id']
    }, {
        fields: ['created_at']
    }]
});

Book.belongsTo(BookCategory, {
    as: "category",
    foreignKey: 'categoryId'
})

Book.belongsTo(BookChapter, {
    as: "lastChapter",
    foreignKey: "lastChapterId"
})

module.exports = Book;