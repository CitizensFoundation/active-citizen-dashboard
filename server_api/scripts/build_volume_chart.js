var models = require('../models');
var async = require('async');
var fs = require('fs');
var moment = require('moment');
var nlp = require('compromise');
var _ = require("lodash");

var monthsCount = {};

models.NewsItem.findAll({
  where: {
    predicted_rating_value: {
      $gt: 0
    }
  }
}).then(function (items) {

  _.forEach(items, function(item) {
    var month = moment(item.created_at).format("MMM");
    if (monthsCount[month]) {
      monthsCount[month]["count"] = monthsCount[month]["count"]+ 1;
    } else {
      monthsCount[month] = { count: 0, monthId: moment(item.created_at).month(), name: month};
    }
  });

  models.DashboardChart.create({
    name: "Volume",
    results_object: monthsCount
  }).then(function (createResults) {
    console.log("Have saved item");
    console.log("Done with");
    process.exit();
  });
});