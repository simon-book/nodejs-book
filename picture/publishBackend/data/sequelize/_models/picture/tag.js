var _ = require('lodash');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Branch = require("../branch/branch.js");
var TagGroup = require("./tagGroup.js");

var Tag = sequelize.define('tag', {
    tagId: {
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
    remark: Sequelize.TEXT,
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
    tagGroupId: {
        type: Sequelize.BIGINT,
        references: {
            model: TagGroup,
            key: 'tag_group_id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        allowNull: true
    }
}, {
    schema: __PGSQL__.schemas.picture_publisher,
    tableName: 'tag',
    timestamps: true,
    underscored: true,
    indexes: []
});

TagGroup.hasMany(Tag, {
    as: "tags",
    foreignKey: 'tagGroupId'
})


module.exports = Tag;