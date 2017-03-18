var models = require('../models');
var async = require('async');
var fs = require('fs');
var moment = require('moment');
const Translate = require('@google-cloud/translate');
var request = require('request');

var counter = 0;
var goodCounter = 0;
var badCounter = 0;

// Your Google Cloud Platform project ID
const projectId = 'AIzaSyD6XEccr0-SvPNpgKdqaZpuxNlij-ior3c';

// Instantiates a client
const translateClient = Translate({
  projectId: projectId
});

var translateItemToEn = function (text, callback) {
  translateClient.translate(text, "en")
    .then( function (results) {
      callback(null, results[0]);
    }).catch(function (error) {
      callback(error);
  });
};

var detectLanguage = function (text, callback) {
  translateClient.detect(text)
    .then( function (results) {
      var detections = results[0];

      if (!Array.isArray(detections)) {
        detections = [detections];
      }

      console.log('Detections:'+detections[0].language);
      callback(null, detections[0].language);
    }).catch(function (error) {
      callback(error);
  });
};


truncate = function (input, length, killwords, end) {
  var orig = input;
  length = length || 255;

  if (input.length <= length)
    return input;

  if (killwords) {
    input = input.substring(0, length);
  } else {
    var idx = input.lastIndexOf(' ', length);
    if (idx === -1) {
      idx = length;
    }

    input = input.substring(0, idx);
  }

  input += (end !== undefined && end !== null) ? end : '...';
  return input;
};

var removeBrackets = function (text) {
  if (text) {
    return truncate(text.replace(/\[/g, "").replace(/\]/g, "").replace(/\&#39;/g, "").
                replace(/\&quot;/g, "").replace(/\&amp;/g, "").replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').
                trim().toLowerCase().replace(/#/g,'').replace(/@/g,'').replace(/"/g,'').replace(/'/g,'').
                replace(/\n/g,' ').replace(/\r/g,' ').
                replace(/[^\x00-\x7F]/g, "").
                replace(/rt /g,'').
                replace(/([#0-9]\u20E3)|[\xA9\xAE\u203C\u2047-\u2049\u2122\u2139\u3030\u303D\u3297\u3299][\uFE00-\uFEFF]?|[\u2190-\u21FF][\uFE00-\uFEFF]?|[\u2300-\u23FF][\uFE00-\uFEFF]?|[\u2460-\u24FF][\uFE00-\uFEFF]?|[\u25A0-\u25FF][\uFE00-\uFEFF]?|[\u2600-\u27BF][\uFE00-\uFEFF]?|[\u2900-\u297F][\uFE00-\uFEFF]?|[\u2B00-\u2BF0][\uFE00-\uFEFF]?|(?:\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDEFF])[\uFE00-\uFEFF]?/g, '')
           , 220);
  } else {
    return null;
  }
};

var trimForTranslation = function (text) {
  if (text) {
    return truncate(text.replace(/\[/g, "").replace(/\]/g, "").replace(/\&#39;/g, "").
      replace(/\&quot;/g, "").replace(/\&amp;/g, "").replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').
      replace(/\n/g,' ').replace(/\r/g,' ')
      , 220);
  } else {
    return null;
  }
};

var getTranslatedItemText = function (item, callback) {
  if (item.translated_text) {
    callback(null, item.translated_text)
  } else {
    detectLanguage(trimForTranslation(item.description), function (error, language) {
      if (error) {
        callback(error);
      } else if (language=='en') {
        callback(null, item.description)
      } else {
        translateItemToEn(trimForTranslation(item.description), function (error, translatedText) {
          callback(error, translatedText);
        });
      }
    });
  }
};

var processItem = function (item, callback) {
  console.log("Item: "+(counter+=1));
  getTranslatedItemText(item, function (error, translatedText) {
    if (error) {
      callback(error)
    } else {
      request("localhost:4227/?text_to_eval="+translatedText, function (error, results) {
        console.log("Eval results: "+results);
        if (error) {
          callback(error);
        } else if (parseFloat(results)==1.0) {
          item.predicted_rating_value = 1.0;
          item.save().then(function () {
            callback(null);
          }).catch(function (error) {
            callback(error);
          });
          goodCounter+=1;
        } else {
          item.predicted_rating_value = -1.0;
          item.save().then(function () {
            callback(null);
          }).catch(function (error) {
            callback(error);
          });
          badCounter+=1;
        }
      });
    }
  });
};

models.NewsItem.findAll({
  where: {
    rating_value: null,
    predicted_rating_value: null,
    created_at: {
      $gt:  moment().add(-1, 'weeks').toISOString()
    }
  }
}).then(function (items) {
  async.eachSeries(items, function (item, callback) {
    processItem(item, callback);
  }, function (error) {
    if (error) {
      console.error(error);
    }
    console.log("Done with "+goodCounter+" good and "+badCounter+" bad");
  });
});