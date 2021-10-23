var Sequelize = require('sequelize');
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Tag = require("./tag.js");
var Picture = require("./picture.js");

var PictureTags = sequelize.define('picture_tags', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true,
    },
    pictureId: {
        type: Sequelize.BIGINT,
        references: {
            model: Picture,
            key: 'picture_id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        allowNull: false
    },
    pictureLastUpdatedAt: Sequelize.DATE,
    originId: Sequelize.TEXT,
    tagId: {
        type: Sequelize.BIGINT,
        references: {
            model: Tag,
            key: 'tag_id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        allowNull: false
    }
}, {
    schema: __PGSQL__.schemas.picture_publisher,
    tableName: 'picture_tags',
    timestamps: false,
    underscored: true,
    indexes: []
});

Picture.belongsToMany(Tag, {
    as: 'tags',
    through: PictureTags,
    foreignKey: 'pictureId'
})

Tag.belongsToMany(Picture, {
    as: 'pictures',
    through: PictureTags,
    foreignKey: 'tagId'
})

module.exports = PictureTags;