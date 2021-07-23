var _ = require('lodash');
var Sequelize = require('sequelize');
var sequelize = require("../../../../service/sequelizeConn.js");

var Branch = require("../branch/branch.js");

var TagGroup = sequelize.define('tag_group', {
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
    type: Sequelize.TEXT,
    // remark: Sequelize.TEXT,
    branchId: {
        type: Sequelize.BIGINT,
        // references: {
        //     model: Branch,
        //     key: 'branch_id',
        //     deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        // },
        allowNull: false
    },
    orderIndex: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    originId: Sequelize.TEXT, //复制原始ID
}, {
    schema: __PGSQL__.schemas.picture_publisher,
    tableName: 'tag_group',
    timestamps: true,
    underscored: true,
    indexes: []
});


module.exports = TagGroup;