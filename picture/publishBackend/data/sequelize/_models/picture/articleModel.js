var Sequelize = require('sequelize');
var moment = require('moment');
var sequelize = require("../../../../service/sequelizeConn.js");

var Model = require("./model.js");
var Article = require("./article.js");

var ArticleModels = sequelize.define('article_models', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true,
    },
    articleId: {
        type: Sequelize.BIGINT,
        references: {
            model: Article,
            key: 'article_id',
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
    tableName: 'article_models',
    timestamps: false,
    underscored: true,
    indexes: []
});

Article.belongsToMany(Model, {
    as: 'models',
    through: ArticleModels,
    foreignKey: 'articleId'
})

Model.belongsToMany(Article, {
    as: 'articles',
    through: ArticleModels,
    foreignKey: 'modelId'
})

module.exports = ArticleModels;