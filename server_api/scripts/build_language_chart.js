var models = require('../models');
var async = require('async');
var fs = require('fs');
var moment = require('moment');
var nlp = require('compromise');
var _ = require("lodash");

var languages = {};

var processItem = function (item, done) {
  if (languages[item.language]!=null) {
    languages[item.language] = languages[item.language] + 1;
  } else {
    languages[item.language] = 0;
  }
  done();
};

models.NewsItem.findAll({
  where: {
    language: {
      $ne: null
    },
    predicted_rating_value: {
      $gt: 0
    }
  }
}).then(function (items) {
  async.eachSeries(items, function (item, callback) {
    processItem(item, callback);
  }, function (error) {
    if (error) {
      console.error(error);
    }

    models.DashboardChart.create({
      name: "LanguagesUsed",
      results_object: languages
    }).then(function (createResults) {
      console.log("Have saved item");
      console.log("Done with");
      process.exit();
    });
  });
});