var models = require('../models');
var async = require('async');
var fs = require('fs');
var moment = require('moment');
var nlp = require('compromise');
var _ = require("lodash");
var fuzz = require('fuzzball');

var foundItemsToCheckAgainst;
var lastFound=null;

var fuzzyCheck = function (originalItem, testItem, done) {
  var textAToCompare = originalItem.translated_text ? originalItem.translated_text : originalItem.description;
  var textBToCompare = testItem.translated_text ? testItem.translated_text : testItem.description;
  var ratio = fuzz.ratio(textAToCompare, textBToCompare);
  if (ratio>70 && originalItem.id != testItem.id) {
    if (!lastFound || lastFound!=textAToCompare) {
      console.log("Fuzzcheck A: "+ratio+" "+textAToCompare);
      lastFound = textAToCompare;
      markItemAsDuplicate(testItem,done);
    }
    console.log("Fuzzcheck B: "+ratio+" "+textBToCompare);
  } else {
    done();
  }
};

var checkOneSeries = function (originalItem, items, done) {
  async.eachSeries(items, function (item, callback) {
    fuzzyCheck(originalItem, item, callback);
  }, function (error) {
    done();
  });
};

var processItem = function (originalItem, done) {
  if (foundItemsToCheckAgainst) {
    checkOneSeries(originalItem,foundItemsToCheckAgainst,done);
  } else {
    models.NewsItem.findAll({
      order: "created_at ASC",
      where: {
        translated_text: {
          $ne: null
        },
        predicted_rating_value: {
          $gt: 0
        },
        created_at: {
          $gt:  moment(originalItem.created_at).add(-2, 'days').toISOString()
        }
      }
    }).then(function (items) {
      console.log("Items to check length: "+items.length);
      foundItemsToCheckAgainst = items;
      checkOneSeries(originalItem,foundItemsToCheckAgainst, done);
    });
  }
};

models.NewsItem.findAll({
  order: "created_at ASC",
  where: {
    predicted_rating_value: {
      $gt: 0
    },
    created_at: {
      $gt:  moment().add(-2, 'days').toISOString()
    }
  }
}).then(function (items) {
  console.log("Items length: "+items.length);
  async.eachSeries(items, function (item, callback) {
    processItem(item, callback);
  }, function (error) {
      console.log("Have saved item");
      console.log("Done with");
      process.exit();
  });
});