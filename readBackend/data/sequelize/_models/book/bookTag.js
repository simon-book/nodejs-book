var Sequelize = require('sequelize');
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Tag = require("./tag.js");
var Book = require("./book.js");

var BookTags = sequelize.define('book_tags', {
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
    tagId: {
        type: Sequelize.BIGINT,
        references: {
            model: Tag,
            key: 'tag_id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        allowNull: false
    }
}, {
    schema: __PGSQL__.schemas.book_publisher,
    tableName: 'book_tags'
});

Tag.belongsToMany(Book, {
    as: 'books',
    through: BookTags,
    foreignKey: 'tagId'
})
Book.belongsToMany(Tag, {
    as: 'tags',
    through: BookTags,
    foreignKey: 'bookId'
})

module.exports = BookTags;