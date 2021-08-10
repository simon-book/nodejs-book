var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Branch = require("../branch/branch.js");

var ModelRank = sequelize.define('model_rank', {
    rankId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    originId: Sequelize.TEXT,
    carousel: Sequelize.JSONB,
    rankModelIds: Sequelize.JSONB,
    // moreLink: Sequelize.TEXT,
    orderIndex: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    branchId: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    statusId: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    }
}, {
    schema: __PGSQL__.schemas.picture_publisher,
    tableName: 'model_rank',
    timestamps: true,
    underscored: true,
});


module.exports = ModelRank;