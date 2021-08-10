var Sequelize = require('sequelize');
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Model = require("./model.js");
var Picture = require("./picture.js");

var PictureModels = sequelize.define('picture_models', {
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
    modelId: {
        type: Sequelize.BIGINT,
        references: {
            model: Model,
            key: 'model_id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        allowNull: false
    }
}, {
    schema: __PGSQL__.schemas.picture_publisher,
    tableName: 'picture_models',
    timestamps: false,
    underscored: true,
    indexes: []
});

Picture.belongsToMany(Model, {
    as: 'models',
    through: PictureModels,
    foreignKey: 'pictureId'
})

Model.belongsToMany(Picture, {
    as: 'pictures',
    through: PictureModels,
    foreignKey: 'modelId'
})

module.exports = PictureModels;