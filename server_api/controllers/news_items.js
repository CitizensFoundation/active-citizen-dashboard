var express = require('express');
var router = express.Router();
var models = require("../models");

var log = require('../utils/logger');
var toJson = require('../utils/to_json');
var _ = require('lodash');
var async = require('async');

router.get('/:', function(req, res) {
  models.NewsItem.findAll(
    {
      offset: 0,
      limit: 200,
      order: [sequelize.json("rating.value"), 'ASC']
    }).then(function (items) {
      res.send(items);
  });
});

router.get('/next_to_rate', function(req, res) {
  models.NewsItem.find(
    {
      where: {
        rating: null,
        description: {
          $ne: null
        }
      },
      order: [
        models.sequelize.fn( 'random' )
      ]
    }).then(function (item) {
    res.send(item);
  }).catch(function (error) {
    res.sendStatus(500);
  });
});

router.get('/rating_stats', function(req, res) {
  var totalRated, totalCount;
  async.parallel([
    function (callback) {
      models.NewsItem.count(
        {
          where: {
            rating: {
              $ne: null
            }
          }
        }).then(function (count) {
        totalRated = count;
        callback();
      }).catch(function (error) {
        callback(error);
      });
    },
    function (callback) {
      models.NewsItem.count({}).then(function (count) {
        totalCount = count;
        callback();
      }).catch(function (error) {
        callback(error);
      });
    },
  ], function (error) {
      if (error) {
        res.sendStatus(500);
      } else {
        res.send({totalRated: totalRated, totalCount: totalCount});
      }
  });
});

router.put('/:id/rate', function(req, res) {
  models.NewsItem.find({
    where: {
      id: req.params.id
    }
  }).then(function (item) {
    if (item) {
      item.set('rating', { ratingValue: req.body.ratingValue, ratingCategoryName: req.body.ratingCategoryName });
      item.save().then(function () {
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(404);
    }
  });
});

module.exports = router;
