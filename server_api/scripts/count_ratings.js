var models = require('../models');
var async = require('async');
var _ = require('lodash');

var pos_predicted_rating_value, neg_predicted_rating_value, ratedLow, ratedMedium, ratedHigh, ratedIrrelevant;

async.series([
  function (callback) {
    models.NewsItem.count({
      where: {
        predicted_rating_value: -1
      }
    }).then(function (count) {
      neg_predicted_rating_value = count;
      callback();
    }).catch(function (error) {
      callback(error);
    })
  },
  function (callback) {
    models.NewsItem.count({
      where: {
        predicted_rating_value: 1
      }
    }).then(function (count) {
      pos_predicted_rating_value = count;
      callback();
    }).catch(function (error) {
      callback(error);
    })
  },
  function (callback) {
    models.NewsItem.count({
      where: {
        rating_value: 2
      }
    }).then(function (count) {
      ratedHigh = count;
      callback();
    }).catch(function (error) {
      callback(error);
    })
  },
  function (callback) {
    models.NewsItem.count({
      where: {
        rating_value: 1
      }
    }).then(function (count) {
      ratedMedium = count;
      callback();
    }).catch(function (error) {
      callback(error);
    })
  },
  function (callback) {
    models.NewsItem.count({
      where: {
        rating_value: 0
      }
    }).then(function (count) {
      ratedLow = count;
      callback();
    }).catch(function (error) {
      callback(error);
    })
  },
  function (callback) {
    models.NewsItem.count({
      where: {
        rating_value: -1
      }
    }).then(function (count) {
      ratedIrrelevant = count;
      callback();
    }).catch(function (error) {
      callback(error);
    })
  }
], function (error) {
  if (error) {
    console.error(error);
  }
  console.log("Done");
  console.log("Rated high: "+ratedHigh+" rated medium: "+ratedMedium+
              " rated low: "+ratedLow+" ratedIrrelevant: "+ratedIrrelevant);

  var ratedRelevant = ratedHigh+ratedMedium+ratedLow;
  console.log("Rated relevant: "+(ratedRelevant)+" Rated not relevant: "+ratedIrrelevant+" % "+(ratedRelevant/ratedIrrelevant));
  console.log("Predicted relevant: "+pos_predicted_rating_value+" Predicted not relevant: "+
               neg_predicted_rating_value+" % "+(pos_predicted_rating_value/neg_predicted_rating_value));
  process.exit();
});

