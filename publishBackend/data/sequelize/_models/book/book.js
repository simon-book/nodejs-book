var _ = require('lodash');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Branch = require("../branch/branch.js");
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
    chapterCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }, //章节数
    // lastChapterId: Sequelize.BIGINT, //最后一章Id
    // lastChapterNumber: { //最后一章number
    //     type: Sequelize.INTEGER,
    //     defaultValue: 0
    // },
    recommend: {
        type: Sequelize.INTEGER,
        defaultValue: 99
    }, //推荐指数
    coinCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }, //已兑换金币数
    readCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }, //阅读数
    wordsCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }, //字数
    bookPrice: {
        type: Sequelize.DECIMAL(21, 2),
        defaultValue: 0
    }, //整本书价格
    chapterPrice: {
        type: Sequelize.DECIMAL(21, 2),
        defaultValue: 0
    }, //单章价格
    categoryId: { //主分类
        type: Sequelize.BIGINT,
        references: {
            model: BookCategory,
            key: 'category_id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        allowNull: false
    },
    freeChapters: {
        type: Sequelize.INTEGER,
        defaultValue: 2
    },
    bookType: {
        type: Sequelize.ENUM("novel", "cartoon", "photo"),
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