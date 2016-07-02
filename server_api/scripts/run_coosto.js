var models = require('../models');
var async = require('async');

var coreRequest = require('request');

request = coreRequest.defaults({jar: true});
// DIFFERENT SLIDERS FOR DIFFERENT CATEGORIES STILL ONE CLICK
var coreUrl = "https://in.coosto.com/";
var loginParams = "?username="+process.env.COOSTO_USERNAME+"&password="+process.env.COOSTO_PASSWORD;

var getAndSaveResults = function (callback) {
  request(coreUrl+"api/1/users/login"+loginParams, function (error, loginResults) {
    models.NewsSearchQuery.findAll({}).then(function (queries) {
      async.eachSeries(queries, function (query, seriesCallback) {
        console.log("Processing Query "+query.name);
        console.log("----------------------------------------------------------------------");
        request(coreUrl+"api/1/query/results?qid="+query.data_object.id, function (error, queryResults) {
          console.log("Got responses");
          var results = JSON.parse(queryResults.body);
          async.eachSeries(results.data[0], function (result, innerSeriesCallback) {
            console.log("Saving response");
            models.NewsItem.find({
              where: {
                data_id: result.id
              }
            }).then(function (item) {
              if (item) {
                console.log("News Item already saved");
                innerSeriesCallback();
              } else if (!result.fulltext) {
                console.log("News Item has no body");
                console.log(result);
                console.log("------------ News Item has no body End -------------");
                innerSeriesCallback();
              } else {
                models.NewsItem.create({
                  name: result.title ? result.title : '',
                  description: result.fulltext,
                  data_id: result.id,
                  news_search_query_id: query.id,
                  data_object: result
                }).then(function (createResults) {
                  console.log("Have saved item");
                  innerSeriesCallback();
                });
              }
            });
          }, function (error) {
            seriesCallback();
          });
        });
      }, function (error) {
        callback();
      });
    });

  });
};

getAndSaveResults(function () {
  console.log("Done");
  process.exit();
});
