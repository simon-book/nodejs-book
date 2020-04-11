var Sequelize = require('sequelize');
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var pageBlockBooks = sequelize.define('page_block_books', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true,
    },
    orderIndex: {
        type: Sequelize.INTEGER,
        defaultValue: function() {
            return new Date().getTime() + Math.ceil(Math.random() * 100000);
        }
    },
    statusId: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    }
}, {
    schema: __PGSQL__.schemas.book_publisher,
    tableName: 'page_block_books',
    timestamps: false,
    underscored: true
    indexes: [{
        fields: ['book_id']
    }, {
        fields: ['page_block_id']
    }]
});



module.exports = pageBlockBooks;