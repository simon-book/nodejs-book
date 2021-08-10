var Sequelize = require('sequelize');
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Tag = require("./tag.js");
var Model = require("./model.js");

var ModelTags = sequelize.define('model_tags', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true,
    },
    modelId: {
        type: Sequelize.BIGINT,
        references: {
            model: Model,
            key: 'model_id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        allowNull: false
    },
    modelOriginId: Sequelize.TEXT,
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
    tableName: 'model_tags',
    timestamps: false,
    underscored: true,
    indexes: []
});

Model.belongsToMany(Tag, {
    as: 'tags',
    through: ModelTags,
    foreignKey: 'modelId'
})

Tag.belongsToMany(Model, {
    as: 'models',
    through: ModelTags,
    foreignKey: 'tagId'
})

ModelTags.hasOne(Tag, {
    as: 'tag',
    foreignKey: 'tagId'
})

ModelTags.hasOne(Model, {
    as: 'model',
    foreignKey: 'modelId'
})

module.exports = ModelTags;