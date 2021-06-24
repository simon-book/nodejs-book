var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var LastRead = sequelize.define('page', {
    date: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true
    },
    bookIds: Sequelize.JSONB
}, {
    schema: __PGSQL__.schemas.book_publisher,
    tableName: 'page',
    timestamps: true,
    underscored: true,
    indexes: [{
        fields: ['date']
    }]
});


module.exports = LastRead;