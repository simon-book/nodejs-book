var _ = require('lodash');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Model = sequelize.define('model', {
    modelId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    name: Sequelize.TEXT, //真实姓名
    nickname: Sequelize.TEXT, //艺名，别名，昵称
    cover: Sequelize.TEXT, //头像
    birthday: Sequelize.DATEONLY,
    zodiac: Sequelize.TEXT, //属相
    constellation: Sequelize.TEXT, //星座
    height: Sequelize.TEXT,
    weight: Sequelize.TEXT,
    figure: Sequelize.TEXT, //身材
    birthIn: Sequelize.TEXT, //出生地
    job: Sequelize.TEXT, //职业
    interests: Sequelize.TEXT, //兴趣爱好
    remark: Sequelize.TEXT,
    originId: Sequelize.TEXT, //复制原始ID
    branchId: Sequelize.BIGINT,
    statusId: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    }
}, {
    schema: __PGSQL__.schemas.picture_publisher,
    tableName: 'model',
    timestamps: false,
    underscored: true,
    indexes: [{
        fields: ['nickname', 'branch_id']
    }, {
        fields: ['origin_id', 'branch_id']
    }]
});

module.exports = Model;