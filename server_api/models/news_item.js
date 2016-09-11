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
    data_id: DataTypes.STRING,
    translated_text: DataTypes.TEXT,
    language: DataTypes.STRING,
    news_search_query_id: DataTypes.STRING,
    ip_address: DataTypes.STRING
  }, {

    underscored: true,

    tableName: 'news_items',

    instanceMethods: {
    },

    classMethods: {

      associate: function(models) {
        NewsItem.belongsTo(models.NewsSearchQuery);
      }
    }
  });

  return NewsItem;
};
