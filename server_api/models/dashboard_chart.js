var async = require("async");
var log = require('../utils/logger');
var toJson = require('../utils/to_json');

"use strict";

module.exports = function(sequelize, DataTypes) {
  var DashboardChart = sequelize.define("DashboardChart", {
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    results_object:  DataTypes.JSONB
  }, {

    underscored: true,

    tableName: 'dashboard_charts',

    instanceMethods: {
    },

    classMethods: {

    }
  });

  return DashboardChart;
};
