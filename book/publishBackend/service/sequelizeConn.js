const Sequelize = require('sequelize');
var moment = require('moment');
var postgres = require('pg');
postgres.types.setTypeParser(20, parseInt);
postgres.types.setTypeParser(1184, function(value) {
    return moment(value).format("YYYY-MM-DD HH:mm:ss");
});
Sequelize.postgres.DECIMAL.parse = function(value) {
    return parseFloat(value);
};

// Option 1: Passing parameters separately
const sequelize = new Sequelize(__PGSQL__.database, __PGSQL__.user, __PGSQL__.password, {
    host: __PGSQL__.host,
    port: __PGSQL__.port,
    dialect: 'postgres',
    dialectOptions: {
        // useUTC: false, //for reading from database
        // dateStrings: true,z
        // typeCast: true
    },
    define: {
        timestamps: true,
        underscored: true,
        paranoid: false
    },
    pool: {
        min: 0,
        max: 100
    },
    logging: null,
    timezone: '+08:00'
});

sequelize.sync({
    // force: true
});

module.exports = sequelize;