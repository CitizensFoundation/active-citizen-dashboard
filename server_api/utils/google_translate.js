const Translate = require('@google-cloud/translate');
var request = require('request');
var google = require('googleapis');

var counter = 0;
var goodCounter = 0;
var badCounter = 0;

// Your Google Cloud Platform project ID

const projectId = 'active-citizen-dashboard';

// Instantiates a client
const translateClient = Translate({
  projectId: projectId
});

var trimForTranslation = function (text) {
  if (text) {
    return text.replace(/\[/g, "").replace(/\]/g, "").replace(/\&#39;/g, "").
    replace(/\&quot;/g, "").replace(/\&amp;/g, "").
    replace(/\n/g,' ').replace(/\r/g,' ');
  } else {
    return null;
  }
};

var translateItemToEn = function (text, callback) {
  google.auth.getApplicationDefault(function(err, authClient) {
    translateClient.translate(trimForTranslation(text), "en")
      .then( function (results) {
        callback(null, results[0]);
      }).catch(function (error) {
      callback(error);
    });
  });
};

var detectLanguage = function (text, callback) {
  google.auth.getApplicationDefault(function(err, authClient) {
    translateClient.detect(trimForTranslation(text))
      .then(function (results) {
        var detections = results[0];

        if (!Array.isArray(detections)) {
          detections = [detections];
        }

        console.log('Detections:' + detections[0].language);
        callback(null, detections[0].language);
      }).catch(function (error) {
      callback(error);
    });
  });
};


module.exports = {
  detectLanguage: detectLanguage,
  translateItemToEn: translateItemToEn
};
