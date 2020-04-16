var _ = require('lodash');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Branch = require("../branch/branch.js");

var Manager = sequelize.define('manager', {
    managerId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    // name: {
    //     type: Sequelize.TEXT,
    //     allowNull: false
    // },
    nickname: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    phone: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    // email: Sequelize.TEXT,
    password: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    avatarUrl: Sequelize.TEXT,
    // salt: Sequelize.TEXT,
    roleType: { //administrator超级管理员，manager普通管理员
        type: Sequelize.TEXT,
        allowNull: false
    },
    remark: Sequelize.TEXT,
    statusId: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    }
}, {
    schema: __PGSQL__.schemas.book_publisher,
    tableName: 'manager',
    timestamps: true,
    underscored: true,
    indexes: [{
        fields: ['branch_id']
    }, {
        fields: ['phone']
    }],
    defaultScope: {
        where: {
            statusId: {
                [Op.ne]: 0
            }
        }
    }
});

module.exports = Manager;