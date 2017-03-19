var models = require('../models');
var async = require('async');
var fs = require('fs');
var moment = require('moment');

models.NewsItem.findAll({
  attributes: ['id','language'],
  where: {
    $or: [
      {
        rating_value: {
          $ne: null
        }
      },
      {
        predicted_rating_value: {
          $ne: null
        }
      }
    ]
  }
}).then(function (items) {
  console.log("Items to clear: "+items.length);
  async.eachSeries(items, function (item, callback) {
    item.set('language', null);
    item.save().then(function () {
      callback();
    }).catch(function (error) {
      callback(error);
    });
  }, function (error) {
    if (error) {
      console.error(error);
    }
    console.log("Done");
    process.exit();
  });
});