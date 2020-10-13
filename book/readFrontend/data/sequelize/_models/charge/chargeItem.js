var _ = require('lodash');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Branch = require("../branch/branch.js");

var ChargeItem = sequelize.define('charge_item', {
    chargeItemId: {
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
    chargeType: { //"coin", "vip"
        type: Sequelize.TEXT,
        allowNull: false
    },
    chargePrice: Sequelize.DECIMAL(21, 2),
    chargeCount: Sequelize.BIGINT,
    presentCount: {
        type: Sequelize.BIGINT,
        defaultValue: 0
    },
    expireDays: { //有效天数，-1永久有效
        type: Sequelize.BIGINT,
        defaultValue: -1
    },
    orderIndex: {
        type: Sequelize.BIGINT,
        defaultValue: function() {
            return new Date().getTime();
        }
    },
    isRecommend: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    isDefault: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    remark: Sequelize.TEXT,
    branchId: {
        type: Sequelize.BIGINT,
        references: {
            model: Branch,
            key: 'branch_id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        allowNull: false
    },
    statusId: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    }
}, {
    schema: __PGSQL__.schemas.book_publisher,
    tableName: 'charge_item',
    defaultScope: {
        where: {
            statusId: {
                [Op.ne]: 0
            }
        }
    }
});


module.exports = ChargeItem;