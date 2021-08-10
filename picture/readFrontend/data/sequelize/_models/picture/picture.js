var _ = require('lodash');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Branch = require("../branch/branch.js");

var Picture = sequelize.define('picture', {
    pictureId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    title: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    // modelIds: Sequelize.ARRAY(Sequelize.BIGINT), //模特
    cover: Sequelize.TEXT, //竖向封面
    horiCover: Sequelize.TEXT, //横向封面
    abstractContent: Sequelize.TEXT, //摘要
    count: Sequelize.INTEGER, //图片数
    pictureList: Sequelize.JSONB,
    pictureHdList: Sequelize.JSONB,
    // recommend: Sequelize.INTEGER, //推荐指数
    readCount: {
        type: Sequelize.INTEGER, //阅读数
        defaultValue: 0
    },
    lastUpdatedAt: Sequelize.DATE, //最近更新时间
    originId: Sequelize.TEXT, //复制原始ID
    branchId: {
        type: Sequelize.BIGINT,
        // references: {
        //     model: Branch,
        //     key: 'branch_id',
        //     deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        // },
        allowNull: false
    }
}, {
    schema: __PGSQL__.schemas.picture_publisher,
    tableName: 'picture',
    timestamps: true,
    underscored: true,
    indexes: [{
        fields: ['branch_id']
    }, {
        fields: ['title']
    }, {
        fields: ['last_updated_at']
    }, {
        fields: ['origin_id']
    }]
});

module.exports = Picture;