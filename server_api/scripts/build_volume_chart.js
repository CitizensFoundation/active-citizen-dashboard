var models = require('../models');
var async = require('async');
var fs = require('fs');
var moment = require('moment');
var nlp = require('compromise');
var _ = require("lodash");

var monthsCount = {};
var monthsCountArray = [];
var monthsCountSorted = [];
var monthsCountFinal = [];

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

  _.forEach(monthsCount, function (monthsCount) {
    monthsCountArray.push([monthsCount.name, monthsCount.count, monthsCount.monthId]);
  });

  monthsCountSorted = _.sortBy(monthsCountArray, function (monthsCountArray) {
    return monthsCountArray[2];
  });

  _.forEach(monthsCountSorted, function (monthsCount) {
    monthsCountFinal.push([monthsCount[0], monthsCount[1]]);
  });

  models.DashboardChart.create({
    name: "Volume",
    results_object: monthsCountFinal
  }).then(function (createResults) {
    console.log("Have saved item");
    console.log("Done with");
    process.exit();
  });
});