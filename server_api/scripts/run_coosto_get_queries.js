var models = require('../models');
var async = require('async');

var coreRequest = require('request');

request = coreRequest.defaults({jar: true});
// DIFFERENT SLIDERS FOR DIFFERENT CATEGORIES STILL ONE CLICK
var coreUrl = "https://in.coosto.com/";
var loginParams = "?username="+process.env.COOSTO_USERNAME+"&password="+process.env.COOSTO_PASSWORD;

var getAndSaveAllQueries = function (callback) {
  request(coreUrl+"api/1/users/login"+loginParams, function (error, loginResults) {
    console.log(loginResults);
    request(coreUrl+"api/1/savedqueries/get_all", function (error, savedQueres) {
      var queries = JSON.parse(savedQueres.body);
      if (queries.status != "failed") {

        async.eachSeries(queries.data, function (query, seriesCallback) {
          var queryId = query.id.toString();
          models.NewsSearchQuery.find({
            where: {
              saved_query_id: queryId
            }
          }).then(function (model) {
            if (model) {
              console.log("Already saved this query "+query.name);
              seriesCallback();
            } else {
              models.NewsSearchQuery.create({
                saved_query_id: query.id,
                name: query.name ? query.name : '',
                data_object: query
              }).then(function () {
                seriesCallback();
              });
            }
          });
        }, function (error) {
          callback();
        });
      } else {
        console.error("Failed with:"+queries.data)
      }
    });
  })
};

getAndSaveAllQueries(function () {
  console.log("Done Queries");
  process.exit();
});
