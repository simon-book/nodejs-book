var _ = require('lodash');
var Sequelize = require('sequelize');
var sequelize = require("../../../../service/sequelizeConn.js");

var Branch = require("../branch/branch.js");

var TagGroup = sequelize.define('tag', {
    tagGroupId: {
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
    branchId: {
        type: Sequelize.BIGINT,
        references: {
            model: Branch,
            key: 'branch_id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        allowNull: false
    },
    orderIndex: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    originId: Sequelize.TEXT, //复制原始ID
    token: Sequelize.TEXT
}, {
    schema: __PGSQL__.schemas.book_publisher,
    tableName: 'tag',
    timestamps: true,
    underscored: true,
    indexes: []
});


module.exports = TagGroup;