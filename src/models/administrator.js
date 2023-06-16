/* eslint-disable no-undef */
// models/chatroom.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbconfig.js');

class Administrator extends Model {}

Administrator.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    
  },
  {
    sequelize,
    modelName: 'Administrators',
    tableName: 'administrators',
  }
);

module.exports = Administrator;
