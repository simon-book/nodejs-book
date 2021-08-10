var _ = require('lodash');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");
var Book = require("../book/book.js");
var BookChapter = require("../book/bookChapter.js");

var UserBookMark = sequelize.define('user_book_mark', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    userId: {
        type: Sequelize.BIGINT,
        allowNull: false
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
    chapterId: {
        type: Sequelize.BIGINT,
        references: {
            model: BookChapter,
            key: 'chapter_id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        allowNull: false
    },
    branchId: {
        type: Sequelize.BIGINT,
        allowNull: false
    }
}, {
    schema: __PGSQL__.schemas.book_publisher,
    tableName: 'user_book_mark',
    timestamps: true,
    underscored: true,
    indexes: [{
        fields: ['user_id']
    }]
});

UserBookMark.belongsTo(Book, {
    as: 'book',
    foreignKey: 'bookId'
})

UserBookMark.belongsTo(BookChapter, {
    as: 'chapter',
    foreignKey: 'chapterId'
})

module.exports = UserBookMark;