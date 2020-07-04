var _ = require('lodash');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var CoinCostRecord = sequelize.define('user_coin_cost_record', {
    recordId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    costCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    targetType: { //"book","chapter"
        type: Sequelize.TEXT,
        allowNull: false
    },
    targetId: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    userId: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    branchId: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    statusId: { //0已删除， 1已记录
        type: Sequelize.INTEGER,
        defaultValue: 1
    }
}, {
    schema: __PGSQL__.schemas.book_reader,
    tableName: 'user_coin_cost_record',
    timestamps: true,
    underscored: true,
    indexes: [{
        fields: ['user_id']
    }, {
        fields: ['target_id']
    }],
    defaultScope: {
        where: {
            statusId: {
                [Op.ne]: 0
            }
        }
    }
});

module.exports = CoinCostRecord;