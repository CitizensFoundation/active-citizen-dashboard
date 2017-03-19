var models = require('../models');
var async = require('async');
var fs = require('fs');
var moment = require('moment');
const Translate = require('@google-cloud/translate');
var request = require('request');
var google = require('googleapis');

var counter = 0;
var goodCounter = 0;
var badCounter = 0;

// Your Google Cloud Platform project ID
// const projectId = 'AIzaSyD6XEccr0-SvPNpgKdqaZpuxNlij-ior3c';

const projectId = 'active-citizen-dashboard';

// Instantiates a client
const translateClient = Translate({
  projectId: projectId
});

var translateItemToEn = function (text, authClient, callback) {
  translateClient.translate(text, "en")
    .then( function (results) {
      callback(null, results[0]);
    }).catch(function (error) {
      callback(error);
  });
};

var detectLanguage = function (text, authClient, callback) {
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

var cleanForPrediction = function (text) {
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
    return text.replace(/\[/g, "").replace(/\]/g, "").replace(/\&#39;/g, "").
      replace(/\&quot;/g, "").replace(/\&amp;/g, "").
      replace(/\n/g,' ').replace(/\r/g,' ');
  } else {
    return null;
  }
};

var getTranslatedItemText = function (item, authClient, callback) {
  detectLanguage(trimForTranslation(item.description), authClient, function (error, language) {
    if (error) {
      callback(error);
    } else if (language=='en') {
      callback(null, item.description, 'en')
    } else {
      translateItemToEn(trimForTranslation(item.description), authClient, function (error, translatedText) {
        callback(error, translatedText, language);
      });
    }
  });
};

var processItem = function (item, callback) {
  console.log("Item: "+(counter+=1));
  google.auth.getApplicationDefault(function(err, authClient) {
    if (err) {
      return callback(err);
    }
    getTranslatedItemText(item, authClient, function (error, translatedText, language) {
      if (error) {
        callback(error)
      } else {
        item.set('language', language);
        console.log("Set language: "+language);
        if (language!='en' && translatedText && translatedText!="") {
          item.set('translated_text', translatedText);
        }
        item.save().then(function () {
          console.log("Item saved");
          setTimeout(function () {
            callback();
          }, 50);
        }).catch(function (error) {
          callback(error);
        });
      }
    });
  });
};

models.NewsItem.findAll({
  where: {
    language: null,
    $or: [
      {
        rating_value: {
          $ne: null
        }
      },
      {
        predicted_rating_value: {
          $ne: null
        }
      }
    ]
  }
}).then(function (items) {
  if (items)
    console.log("Items: "+items.length);
  async.eachSeries(items, function (item, callback) {
    processItem(item, callback);
  }, function (error) {
    if (error) {
      console.error(error);
    }
    console.log("Done with "+goodCounter+" good and "+badCounter+" bad");
    process.exit();
  });
});