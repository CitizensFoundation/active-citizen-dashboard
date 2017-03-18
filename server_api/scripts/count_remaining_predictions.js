var models = require('../models');
var async = require('async');
var fs = require('fs');
var moment = require('moment');

models.NewsItem.count({
  where: {
    rating_value: null,
    predicted_rating_value: null,
    created_at: {
      $gt:  moment().add(-4, 'days').toISOString()
    }
  }
}).then(function (count) {
  console.log("You have "+count+" remaining");
  process.exit();
});