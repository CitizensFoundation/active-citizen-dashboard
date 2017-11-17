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

var skipTexts = [
  "Barcelona Centre Universitari can help you to prepare your [study abroad] experience in Barcelona"
];

var shouldSkip = function (description) {
  var skip = false;
  for (var i = 0; i < skipTexts.length; i++) {
    if (description.indexOf(skipTexts[i]) >= 0) {
      skip = true;
    }
  }
  return skip;
};

var wordToFilter = ["erasmus","african culture","french culture","frdesouche","rebeudeter",
  "jsuis en teme","spain","italy","france","all","month","months","day","days","her","him","thing","my",
  "the erasmus girl","if","be","english","student","discover","year","years","what","times","things",
"[erasmus]","[#erasmus]","[study abroad]","[your study abroad]","your [study abroad]",""];

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
  var text;
  if (item.translated_text) {
    text = item.translated_text.trim()+" ";
  } else {
    text = item.description.trim()+" ";
  }
  if (!shouldSkip(text)) {
    allTheText += text;
    console.log(text);
  } else {
    console.error(text);
  }
  done();
};

models.NewsItem.findAll({
  order: "created_at DESC",
  where: {
    predicted_rating_value: {
      $gt: 0
    },
    created_at: {
      $gt:  moment().add(-5, 'days').toISOString()
    }
  }
}).then(function (items) {
  //items = _.dropRight(items,items.length-2000)
  async.eachSeries(items, function (item, callback) {
    processItem(item, callback);
  }, function (error) {
    if (error) {
      console.error(error);
    }

    console.log("Analytics text...");
    var results = nlp(allTheText).nouns().out('freq');

    var filteredWords = filterWords(_.dropRight(results,results.length-200));

    var filteredArray = [];

    _.forEach(filteredWords, function (word) {
        filteredArray.push([word.normal.replace("[","").replace("]",""), word.count]);
    });

    models.DashboardChart.create({
      name: "WordCloud",
      results_object: filteredArray
    }).then(function (createResults) {
      console.log("Have saved item");
      console.log("Done with");
      process.exit();
    });
  });
});