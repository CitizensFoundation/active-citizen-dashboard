var models = require('../models');
var async = require('async');
var fs = require('fs');
var moment = require('moment');

function cleanString(str) {
  return str.replace(/[^\w\s]|_/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function extractSubstr(str, regexp) {
  return cleanString(str).match(regexp) || [];
}

function getWordsByNonWhiteSpace(str) {
  return extractSubstr(str, /\S+/g);
}

function getWordsByWordBoundaries(str) {
  return extractSubstr(str, /\b[a-z\d]+\b/g);
}

function wordMap(str) {
  return getWordsByWordBoundaries(str).reduce(function(map, word) {
    map[word] = (map[word] || 0) + 1;
    return map;
  }, {});
}

function mapToTuples(map) {
  return Object.keys(map).map(function(key) {
    return [ key, map[key] ];
  });
}

function mapToSortedTuples(map, sortFn, sortOrder) {
  return mapToTuples(map).sort(function(a, b) {
    return sortFn.call(undefined, a, b, sortOrder);
  });
}

function countWords(str) {
  return getWordsByWordBoundaries(str).length;
}

function wordFrequency(str) {
  return mapToSortedTuples(wordMap(str), function(a, b, order) {
    if (b[1] > a[1]) {
      return order[1] * -1;
    } else if (a[1] > b[1]) {
      return order[1] * 1;
    } else {
      return order[0] * (a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0));
    }
  }, [1, -1]);
}

function printTuples(tuples) {
  return tuples.map(function(tuple) {
    return padStr(tuple[0], ' ', 12, 1) + ' -> ' + tuple[1];
  }).join('\n');
}

function padStr(str, ch, width, dir) {
  return (width <= str.length ? str : padStr(dir < 0 ? ch + str : str + ch, ch, width, dir)).substr(0, width);
}

function toTable(data, headers) {
  return $('<table>').append($('<thead>').append($('<tr>').append(headers.map(function(header) {
    return $('<th>').html(header);
  })))).append($('<tbody>').append(data.map(function(row) {
    return $('<tr>').append(row.map(function(cell) {
      return $('<td>').html(cell);
    }));
  })));
}


var allTheText = "";

var processItem = function (item, done) {
  allTheText += item.translated_text.trim()+" ";
  done();
};

models.NewsItem.findAll({
  where: {
    translated_text: {
      $ne: null
    },
    created_at: {
      $gt:  moment().add(-1, 'months').toISOString()
    }
  }
}).then(function (items) {
  async.eachSeries(items, function (item, callback) {
    processItem(item, callback);
  }, function (error) {
    if (error) {
      console.error(error);
    }
    var wordFreq = wordFrequency(allTheText);
    var wordCount = countWords(allTheText);
    var uniqueWords = wordFreq.length;
    var summaryData = [
      [ 'TOTAL', wordCount ],
      [ 'UNIQUE', uniqueWords ]
    ];
    var table = toTable(wordFreq, ['Word', 'Frequency']);

    console.log("Done with "+goodCounter+" good and "+badCounter+" bad");
    process.exit();
  });
});