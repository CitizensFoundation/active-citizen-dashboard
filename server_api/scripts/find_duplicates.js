var models = require('../models');
var async = require('async');
var fs = require('fs');
var moment = require('moment');
var nlp = require('compromise');
var _ = require("lodash");


/*
  options:
  - minCount: minimum gram frequency, default: 10
  - maxSize: max gram count, default: 3
*/

var wordToFilter = ["erasmus","african culture","french culture","frdesouche","rebeudeter",
  "jsuis en teme","spain","italy","month","months","day","days","her","him","thing","my",
  "the erasmus girl","if","be","english","student","discover","year","years"];

var filterWords = function (words) {
  words = _.filter(words, function (word) {
    if (wordToFilter.indexOf(word.normal) > -1) {
      return false;
    } else {
      return true;
    }
  });
  return words;
};

var allTheText = "";

var processItem = function (item, done) {
  var text = item.translated_text.trim()+" ";
  allTheText += text;
  console.log(text);
  done();
};

models.NewsItem.findAll({
  order: "created_at DESC",
  where: {
    translated_text: {
      $ne: null
    },
    predicted_rating_value: {
      $gt: 0
    },
    created_at: {
      $gt:  moment().add(-30, 'days').toISOString()
    }
  }
}).then(function (items) {
  async.eachSeries(items, function (item, callback) {
    processItem(item, callback);
  }, function (error) {
    if (error) {
      console.error(error);
    }

    console.log("Analytics text...");
    var results = nlp(allTheText).nouns().out('freq');

    var filteredWords = filterWords(_.dropRight(results,results.length-60));

    models.DashboardChart.create({
      name: "Word Cloud 30 days",
      results_object: filteredWords
    }).then(function (createResults) {
      console.log("Have saved item");
      console.log("Done with");
      process.exit();
    });
  });
});