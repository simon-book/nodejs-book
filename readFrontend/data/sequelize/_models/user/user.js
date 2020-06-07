var _ = require('lodash');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var User = sequelize.define('user', {
    userId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    account: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    password: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    nickname: Sequelize.TEXT,
    phone: Sequelize.TEXT,
    avatarUrl: Sequelize.TEXT,
    wxOpenId: Sequelize.TEXT,
    branchId: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    vipType: { //none，vip
        type: Sequelize.TEXT,
        defaultValue: "none"
    },
    vipEndDate: Sequelize.DATE,
    coinAmount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    statusId: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    }
}, {
    schema: __PGSQL__.schemas.book_shower,
    tableName: 'user',
    timestamps: true,
    underscored: true,
    indexes: [{
        fields: ['branch_id']
    }, {
        fields: ['account']
    }],
    defaultScope: {
        where: {
            statusId: {
                [Op.ne]: 0
            }
        }
    }
});

module.exports = User;