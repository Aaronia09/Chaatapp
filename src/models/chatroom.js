/* eslint-disable no-undef */
// models/chatroom.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbconfig.js');

class Chatroom extends Model {}

Chatroom.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'Chatroom',
    tableName: 'chatrooms',
  }
);

module.exports = Chatroom;
