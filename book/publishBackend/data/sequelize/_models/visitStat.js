var _ = require('lodash');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../service/sequelizeConn.js");

var VisitStat = sequelize.define('visit_stat', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    branchId: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    date: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    hostname: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }
}, {
    schema: __PGSQL__.schemas.book_publisher,
    tableName: 'visit_stat',
    timestamps: true,
    underscored: true,
    indexes: [{
        fields: ['date']
    }]
});

module.exports = VisitStat;