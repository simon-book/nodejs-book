var _ = require('lodash');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Branch = require("../brach/branch.js");
var Book = require("./book.js");

var BookChapter = sequelize.define('book_chapter', {
    chapterId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    number: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    title: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    cover: Sequelize.TEXT, //竖向封面
    price: Sequelize.INTEGER, //本章价格
    contentFormat: {
        type: Sequelize.ENUM("text", "picture"),
        allowNull: false
    },
    contentText: Sequelize.TEXT,
    contentPictures: Sequelize.JSONB,
    sourceDomain: Sequelize.TEXT,
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


module.exports = BookChapter;