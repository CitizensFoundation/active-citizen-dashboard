var models = require('../models');
var async = require('async');
var fs = require('fs');
var moment = require('moment');
var nlp = require('compromise');
var _ = require("lodash");

var languages = {};
var languagesArray = [];
var languagesSorted = [];
var languagesArrayFinal = [];

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

    _.forEach(languages, function (count, language) {
      languagesArray.push([language, count]);
    });

    languagesSorted = _.orderBy(languagesArray, function (language) {
      return !language[1];
    });

    var other = 0;
    _.forEach(languagesSorted, function (language, index) {
      if (index<6) {
        languagesArrayFinal.push([language[0], language[1]]);
      } else {
        other = other + language[1];
      }
    });
    languagesArrayFinal.push(["other", other]);

    models.DashboardChart.create({
      name: "LanguagesUsed",
      results_object: languagesArrayFinal
    }).then(function (createResults) {
      console.log("Have saved item");
      console.log("Done with");
      process.exit();
    });
  });
});