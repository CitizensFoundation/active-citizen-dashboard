var models = require('../models');
var async = require('async');

models.NewsItem.findAll({}).then(function (items) {
  async.eachSeries(items, function (item, callback) {
    item.set('rating', null);
    item.save().then(function () {
      callback();
    })
  }, function () {
    console.log("Done");
    process.exit();
  });
});