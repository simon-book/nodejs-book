var Sequelize = require('sequelize');
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Branch = require("../brach/branch.js");
var Book = require("../book/book.js");
var PageBlockBook = require("./pageBlockBook.js");

var PageBlock = sequelize.define('page_block', {
    blockId: {
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
    blockKey: Sequelize.TEXT,
    carousel: Sequelize.JSONB,
    // [{
    //     title: "健身教练",
    //     img: "http://img.xjdcyw.com/img/5e7d5ac9fc31a30d57b92f2f.img_500_0.img",
    //     url: "https://m.hzjmmm.com/#/book/1388",
    // }]
    orderIndex: Sequelize.BIGINT,
    label: Sequelize.TEXT,
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
    tableName: 'page_block',
    timestamps: true,
    underscored: true,
    indexes: [{
        fields: ['branch_id']
    }],
    defaultScope: {
        where: {
            statusId: {
                [Op.ne]: 0
            }
        }
    }
});

Book.belongsToMany(PageBlock, {
    as: 'pageBlocks',
    through: PageBlockBook,
    foreignKey: 'bookId'
})
PageBlock.belongsToMany(Book, {
    as: 'books',
    through: PageBlockBook,
    foreignKey: 'pageBlockId'
})


module.exports = PageBlock;