var _ = require('lodash');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Branch = require("../brach/branch.js");

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
    keywords: Sequelize.TEXT,
    cover: Sequelize.TEXT, //竖向封面
    horiCover: Sequelize.TEXT, //横向封面
    abstractContent: Sequelize.TEXT, //摘要
    chapterCount: Sequelize.INTEGER, //章节数
    lastChapterId: Sequelize.BIGINT, //最后一章Id
    recommend: Sequelize.INTEGER, //推荐指数
    coinCount: Sequelize.INTEGER, //已兑换金币数
    readCount: Sequelize.INTEGER, //阅读数
    wordsCount: Sequelize.INTEGER, //字数
    bookPrice: Sequelize.INTEGER, //整本书价格
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
    categoryIds: {
        type: Sequelize.ARRAY(Sequelize.BIGINT),
        get: function() {
            return _.map(this.getDataValue("categoryIds"), function(value) {
                return parseInt(value)
            })
        },
        allowNull: false
    },
    branchId: {
        type: Sequelize.BIGINT,
        references: {
            model: Branch,
            key: 'id',
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