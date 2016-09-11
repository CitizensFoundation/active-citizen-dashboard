var models = require('../models');
var async = require('async');

models.NewsItem.findAll({
  where: {
    rating: {
      $ne: null
    }
  }
}).then(function (items) {
  async.eachSeries(items, function (item, callback) {
    item.set('rating_value', item.rating.ratingValue);
    item.set('rating_category_name', item.rating.ratingCategoryName);
    item.save().then(function () {
      callback();
    })
  }, function () {
    console.log("Done");
    process.exit();
  });
});