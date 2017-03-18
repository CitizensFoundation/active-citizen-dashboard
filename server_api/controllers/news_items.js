var express = require('express');
var router = express.Router();
var models = require("../models");

var log = require('../utils/logger');
var toJson = require('../utils/to_json');
var _ = require('lodash');
var async = require('async');
var moment = require('moment');

var defaultOrder = [
  ["rating_value", 'DESC'],
  ["created_at", 'DESC']
];

var defaultPredictionOrder = [
  ["predicted_rating_value", 'DESC'],
  ["created_at", 'DESC']
];

router.get('/:', function(req, res) {
  models.NewsItem.findAll(
    {
      offset: 0,
      limit: 1000,
      order: defaultOrder
    }).then(function (items) {
      res.send(items);
  });
});

router.get('/get_item/:id', function(req, res) {
  models.NewsItem.find(
    {
      where: {
        id:  req.params.id
      }
    }).then(function (item) {
    res.send(item);
  });
});

router.get('/predicted_relevant', function(req, res) {
  models.NewsItem.findAll(
    {
      offset: 0,
      limit: 1000,
      where: {
        predicted_rating_value: {
          $gt: 0
        },
        rating_value: null
      },
      order: defaultPredictionOrder
    }).then(function (items) {
    res.send(items);
  }).catch(function (error) {
    res.sendStatus(500);
  });
});

router.get('/predicted_not_relevant', function(req, res) {
  models.NewsItem.findAll(
    {
      offset: 0,
      limit: 1000,
      where: {
        predicted_rating_value: {
          $lt: 0
        },
        rating_value: null
      },
      order: defaultPredictionOrder
    }).then(function (items) {
    res.send(items);
  }).catch(function (error) {
    res.sendStatus(500);
  });
});


router.get('/by_category/:category', function(req, res) {
  if (req.params.category!="all") {
    models.NewsItem.findAll(
      {
        offset: 0,
        limit: 1000,
        where: {
          $and: [
            { rating_category_name: req.params.category },
            { rating_value: { $gt: 0 }
            }
          ]
        },
        order: defaultOrder
      }).then(function (items) {
      res.send(items);
    }).catch(function (error) {
      res.sendStatus(500);
    });
  } else {
    models.NewsItem.findAll(
      {
        offset: 0,
        limit: 1000,
        where: {
          rating_value: {
            $gt: 0
          }
        },
        order: defaultOrder
      }).then(function (items) {
      res.send(items);
    }).catch(function (error) {
      res.sendStatus(500);
    });
  }
});

router.get('/next_to_rate', function(req, res) {
  models.NewsItem.find(
    {
      where: {
        rating_value: null,
        description: {
          $ne: null
        },
        news_search_query_id: {
          notIn: ["1"]
        },
        created_at: {
          $gt:  moment().add(-3, 'months').toISOString()
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

router.get('/getSearchQueries', function(req, res) {
  models.NewsSearchQuery.findAll(
    {
      attributes: ['id','name']
    }).then(function (queries) {
    res.send(queries);
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
            rating_value: {
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
    }
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
      item.set('rating_value', req.body.ratingValue);
      item.set('rating_category_name', req.body.ratingCategoryName);
      item.save().then(function () {
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(404);
    }
  });
});

router.put('/:id/add_translation', function(req, res) {
  models.NewsItem.find({
    where: {
      id: req.params.id
    }
  }).then(function (item) {
    if (item) {
      item.set('translated_text', req.body.translated_text);
      item.set('language', req.body.language);
      item.save().then(function () {
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(404);
    }
  });
});

router.put('/:id/update_language', function(req, res) {
  models.NewsItem.find({
    where: {
      id: req.params.id
    }
  }).then(function (item) {
    if (item) {
      item.set('language', req.body.language);
      item.save().then(function () {
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(404);
    }
  });
});

module.exports = router;
