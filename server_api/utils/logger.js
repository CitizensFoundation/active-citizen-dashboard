var bunyan = require('bunyan');
var PrettyStream = require('bunyan-prettystream');

var logger;

if (process.env.NODE_ENV != 'production') {
  var prettyStdOut = new PrettyStream({useColor: true});
  prettyStdOut.pipe(process.stdout);

  logger = bunyan.createLogger({
    name: 'active-citizen-dashboard',
    streams: [{
      level: 'debug',
      type: 'raw',
      stream: prettyStdOut
    }]
  });
} else {
  logger = bunyan.createLogger({name: "active-citizen-dashboard"});
}

module.exports = logger;
