var async = require("async");
var log = require('../utils/logger');
var toJson = require('../utils/to_json');

"use strict";

module.exports = function(sequelize, DataTypes) {
  var NewsSearchQuery = sequelize.define("NewsSearchQuery", {
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    data_object:  DataTypes.JSONB,
    saved_query_id: DataTypes.STRING,
    ip_address: DataTypes.STRING
  }, {

    underscored: true,

    tableName: 'news_search_queries',

    instanceMethods: {
    },

    classMethods: {

      associate: function(models) {
        NewsSearchQuery.hasMany(models.NewItems);
      }
    }
  });

  return NewsSearchQuery;
};
