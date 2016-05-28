var async = require("async");
var log = require('../utils/logger');
var toJson = require('../utils/to_json');

"use strict";

module.exports = function(sequelize, DataTypes) {
  var NewsItem = sequelize.define("NewsItem", {
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    rating:  DataTypes.JSONB,
    data_object:  DataTypes.JSONB,
    ip_address: DataTypes.STRING
  }, {

    underscored: true,

    tableName: 'news_item',

    instanceMethods: {
    },

    classMethods: {

      associate: function(models) {
      }
    }
  });

  return NewsItem;
};
