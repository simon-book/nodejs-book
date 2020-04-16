var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Branch = sequelize.define('branch', {
    branchId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true,
    },
    name: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    sn: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
    },
    // contacts: {
    //     type: Sequelize.TEXT,
    //     allowNull: false
    // },
    // phone: {
    //     type: Sequelize.TEXT,
    //     allowNull: false
    // },
    // email: Sequelize.TEXT,
    ServicePhone: Sequelize.TEXT,
    ServiceEmail: Sequelize.TEXT,
    ServiceOnline: Sequelize.TEXT,
    domainName: Sequelize.TEXT,
    branchType: { //主master，副agency
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: "master"
    },
    masterBranchId: Sequelize.BIGINT,
    remark: Sequelize.TEXT,
    statusId: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    }
}, {
    schema: __PGSQL__.schemas.book_publisher,
    tableName: 'branch',
    timestamps: true,
    underscored: true,
    indexes: [{
        fields: ['name']
    }],
    defaultScope: {
        where: {
            statusId: {
                [Op.ne]: 0
            }
        }
    }
});


module.exports = Branch;