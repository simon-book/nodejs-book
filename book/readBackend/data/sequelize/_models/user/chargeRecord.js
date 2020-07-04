var _ = require('lodash');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var UserChargeRecord = sequelize.define('user_charge_record', {
    recordId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    chargeTotal: Sequelize.DECIMAL(21, 2),
    chargePaid: Sequelize.DECIMAL(21, 2),
    paidTime: Sequelize.DATE,
    chargeItemId: { //"coin", "vip"
        type: Sequelize.TEXT,
        allowNull: false
    },
    chargeItemType: { //"coin", "vip"
        type: Sequelize.TEXT,
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
    statusId: { //0已删除， 1已记录，2已完成，3已取消或已过期
        type: Sequelize.INTEGER,
        defaultValue: 1
    }
}, {
    schema: __PGSQL__.schemas.book_reader,
    tableName: 'user_charge_record',
    timestamps: true,
    underscored: true,
    indexes: [{
        fields: ['user_id']
    }],
    defaultScope: {
        where: {
            statusId: {
                [Op.ne]: 0
            }
        }
    }
});

module.exports = UserChargeRecord;