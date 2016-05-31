var coreRequest = require('request');

request = coreRequest.defaults({jar: true});

var coreUrl = "https://in.coosto.com/";
var loginParams = "?username="+process.env.COOSTO_USERNAME+"&password="+process.env.COOSTO_PASSWORD;

request(coreUrl+"api/1/users/login"+loginParams, function (error, loginResults) {
  console.log(loginResults);
  request(coreUrl+"api/1/savedqueries/get_all", function (error, savedQueres) {
    var queries = JSON.parse(savedQueres.body);
    request(coreUrl+"api/1/query/results?qid=113805", function (error, queryResults) {
      var results = JSON.parse(queryResults.body);
    });
  });
});