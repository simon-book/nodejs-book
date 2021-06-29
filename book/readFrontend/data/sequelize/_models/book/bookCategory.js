var _ = require('lodash');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Branch = require("../branch/branch.js");

var BookCategory = sequelize.define('book_category', {
    categoryId: {
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
    branchId: {
        type: Sequelize.BIGINT,
        references: {
            model: Branch,
            key: 'branch_id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        allowNull: false
    },
    relatedCategoryIds: Sequelize.JSONB,
    orderIndex: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    originId: Sequelize.TEXT, //复制原始ID
    token: Sequelize.TEXT,
    recommendBooks: Sequelize.JSONB,
    statusId: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    }
}, {
    schema: __PGSQL__.schemas.book_publisher,
    tableName: 'book_category',
    // defaultScope: {
    //     where: {
    //         statusId: {
    //             [Op.ne]: 0
    //         }
    //     }
    // }
});


module.exports = BookCategory;