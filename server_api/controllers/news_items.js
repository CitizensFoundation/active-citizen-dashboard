var express = require('express');
var router = express.Router();
var models = require("../models");
var auth = require('../authorization');
var log = require('../utils/logger');
var toJson = require('../utils/to_json');
var _ = require('lodash');
var async = require('async');

router.get('/', function(req, res) {
  models.NewItem.findAll(
    {
      offset: 0,
      limit: 200,
      order: [sequelize.json("rating.value"), 'ASC']
    }).then(function (items) {
      req.send(items);
  });
});

router.get('/next_to_rate', function(req, res) {
  models.NewItem.find(
    {
      where: {
        rating: null
      },
      order: [
        Sequelize.fn( 'RAND' )
      ]
    }).then(function (item) {
    req.send(item);
  });
});

router.put('/:newsItemId', function(req, res) {
  models.NewItem.find({
    where: {
      id: req.params.newsItemId
    }
  }).then(function (item) {
    if (item) {
      item.set('rating', { value: req.body.ratingValue });
      item.save().then(function () {
        req.sendStatus(200);
      });
    } else {
      req.sendStatus(404);
    }
  });
});

module.exports = router;
