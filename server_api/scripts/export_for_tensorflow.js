var models = require('../models');
var async = require('async');
var fs = require('fs');
var counter = 0;
var goodCounter = 0;
var badCounter = 0;

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

/*request(coreUrl+"api/1/users/login"+loginParams, function (error, loginResults) {

});
*/

var pos = "";
var neg = "";

var posFilename="/tmp/deepy1.pos";
var negFilename="/tmp/deepy1.neg";

models.NewsItem.findAll({
  where: {
    rating_value: {
      $ne: null
    }
  }
}).then(function (items) {
  async.eachSeries(items, function (item, callback) {
    console.log("Item: "+(counter+=1));
    if (item.rating_value>=0) {
      console.log("Good rating value: "+item.rating_value);
      goodCounter+=1;
      if (item.translated_text) {
        console.log(cleanForPrediction(item.translated_text));
        pos += cleanForPrediction(item.translated_text) + "\n";
      } else {
        console.log(cleanForPrediction(item.description));
        pos += cleanForPrediction(item.description)+ "\n";
      }
    } else {
      console.log("Bad rarting at: "+item.rating_value);
      badCounter+=1;
      if (item.translated_text) {
        console.log(cleanForPrediction(item.translated_text));
        neg += cleanForPrediction(item.translated_text) + "\n";
      } else {
        console.log(cleanForPrediction(item.description));
        neg += cleanForPrediction(item.description)+ "\n";
      }
    }
    console.log("---------------");
    callback();
  }, function () {
    console.log("Done with "+goodCounter+" good and "+badCounter+" bad");
    fs.writeFile(posFilename, pos, function(err) {
      if(err) {
        console.log(err);
      }
      fs.writeFile(negFilename, neg, function(err) {
        if(err) {
          console.log(err);
        }
        process.exit();
      });
    });
  });
});