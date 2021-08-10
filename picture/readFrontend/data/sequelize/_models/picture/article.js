var _ = require('lodash');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Branch = require("../branch/branch.js");

var Article = sequelize.define('article', {
    articleId: {
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
    keywords: Sequelize.TEXT,
    description: Sequelize.TEXT,
    cover: Sequelize.TEXT, //竖向封面
    horiCover: Sequelize.TEXT, //横向封面
    content: Sequelize.JSONB,
    readCount: {
        type: Sequelize.INTEGER, //阅读数
        defaultValue: 0
    },
    relatedModelIds: Sequelize.JSONB,
    lastUpdatedAt: Sequelize.DATE, //更新时间
    originId: Sequelize.TEXT, //复制原始ID
    branchId: {
        type: Sequelize.BIGINT,
        allowNull: false
    }
}, {
    schema: __PGSQL__.schemas.picture_publisher,
    tableName: 'article',
    createdAt: true,
    updatedAt: false,
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

module.exports = Article;