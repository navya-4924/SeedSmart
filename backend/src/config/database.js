const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('seedsmart_db', 'postgres', 'admin123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

module.exports = sequelize;