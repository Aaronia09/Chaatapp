/* eslint-disable no-undef */
// models/message.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbconfig.js');

class Message extends Model {}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
  }
);

module.exports = Message;
