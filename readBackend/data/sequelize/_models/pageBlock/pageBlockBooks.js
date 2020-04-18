var Sequelize = require('sequelize');
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Book = require("../book/book.js");
var PageBlock = require("./pageBlock.js");

var PageBlockBooks = sequelize.define('page_block_books', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true,
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
    blockId: {
        type: Sequelize.BIGINT,
        references: {
            model: PageBlock,
            key: 'block_id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        allowNull: false
    },
    orderIndex: {
        type: Sequelize.BIGINT,
        defaultValue: function() {
            return new Date().getTime() + Math.ceil(Math.random() * 100000);
        }
    }
}, {
    schema: __PGSQL__.schemas.book_publisher,
    tableName: 'page_block_books'
});

Book.belongsToMany(PageBlock, {
    as: 'pageBlocks',
    through: PageBlockBooks,
    foreignKey: 'bookId'
})
PageBlock.belongsToMany(Book, {
    as: 'books',
    through: PageBlockBooks,
    foreignKey: 'blockId'
})

module.exports = PageBlockBooks;