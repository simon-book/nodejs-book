var _ = require('lodash');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Branch = require("../brach/branch.js");
var BookCategory = require("./bookCategory.js");

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
    // subtitle: {
    //     type: Sequelize.TEXT,
    //     allowNull: false
    // },
    sn: Sequelize.TEXT, //编码
    keywords: Sequelize.TEXT,
    writer: Sequelize.TEXT,
    cover: Sequelize.TEXT, //竖向封面
    horiCover: Sequelize.TEXT, //横向封面
    abstractContent: Sequelize.TEXT, //摘要
    chapterCount: Sequelize.INTEGER, //章节数
    lastChapterId: Sequelize.BIGINT, //最后一章Id
    lastChapterNumber: { //最后一章number
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    recommend: Sequelize.INTEGER, //推荐指数
    coinCount: Sequelize.INTEGER, //已兑换金币数
    readCount: Sequelize.INTEGER, //阅读数
    wordsCount: Sequelize.INTEGER, //字数
    bookPrice: Sequelize.INTEGER, //整本书价格
    category1Id: { //主分类
        type: Sequelize.BIGINT,
        references: {
            model: BookCategory,
            key: 'category_id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        allowNull: false
    },
    category2Id: { //次分类
        type: Sequelize.BIGINT,
        references: {
            model: BookCategory,
            key: 'category_id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        allowNull: true
    },
    freeChapters: {
        type: Sequelize.INTEGER,
        defaultValue: 2
    },
    bookType: {
        type: Sequelize.ENUM("novel", "cartoon"),
        allowNull: false
    },
    publishStatus: {
        type: Sequelize.ENUM("serialize", "finish"),
        allowNull: false,
        defaultValue: "serialize"
    },
    vipOnly: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    chargeType: {
        type: Sequelize.ENUM("vip_free", "all_free", "none_free"),
        allowNull: false,
        defaultValue: "vip_free"
    },
    branchId: {
        type: Sequelize.BIGINT,
        references: {
            model: Branch,
            key: 'branch_id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        allowNull: false
    },
    statusId: {
        type: Sequelize.INTEGER,
        defaultValue: 1
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
    }],
    defaultScope: {
        where: {
            statusId: {
                [Op.ne]: 0
            }
        }
    }
});


module.exports = Book;