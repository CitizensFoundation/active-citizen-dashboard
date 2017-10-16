#!/usr/bin/env node

var FORCE_PRODUCTION_MODE = true;

var debug = require('debug')('active-citizen-dashboard');
var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var ConnectRoles = require('connect-roles');
var RedisStore = require('connect-redis')(session);
var useragent = require('express-useragent');
var requestIp = require('request-ip');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , FacebookStrategy = require('passport-facebook').Strategy
  , GitHubStrategy = require('passport-github').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var newsItems = require('./controllers/news_items');

var models = require('./models');

var log = require('./utils/logger');
var toJson = require('./utils/to_json');
var sso = require('passport-sso');
var cors = require('cors');

if (process.env.REDISTOGO_URL) {
  process.env.REDIS_URL = process.env.REDISTOGO_URL;
}

var app = express();
app.set('port', process.env.PORT || 7272);

//var airbrake = require('airbrake').createClient(process.env.AIRBRAKE_PROJECT_ID, process.env.AIRBRAKE_API_KEY);
//airbrake.handleExceptions();
//app.use(airbrake.expressHandler());

if (app.get('env') != 'development') {
  app.use(function(req, res, next) {
    if (!/https/.test(req.protocol)){
      res.redirect("https://" + req.headers.host + req.url);
    } else {
      return next();
    }
  });
}

app.use(morgan('combined'));
app.use(useragent.express());
app.use(requestIp.mw());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var sessionConfig = {
  store: new RedisStore({url: process.env.REDIS_URL}),
  name: 'ac_dashboard.sid',
  secret: process.env.SESSION_SECRET ? process.env.SESSION_SECRET : 'not so secret... use env var.',
  resave: true,
  cookie: { autoSubDomain: true },
  saveUninitialized: true
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sessionConfig.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

if (app.get('env') === 'development' && !FORCE_PRODUCTION_MODE) {
  app.use(express.static(path.join(__dirname, '../client_app')));
} else {
  app.use(express.static(path.join(__dirname, '../client_app/build/bundled')));
}

var bearerCallback = function (req, token) {
  return console.log('The user has tried to authenticate with a bearer token');
};

passport.serializeUser(function(profile, done) {
  log.info("User Serialized From", { profile: profile });
  if (profile.provider && profile.provider=='facebook') {
    models.User.serializeFacebookUser(profile, function (error, user) {
      if (error) {
        log.error("Error in User Serialized from Facebook", {err: error });
        done(error);
      } else {
        log.info("User Serialized Connected to Facebook", { context: 'loginFromFacebook', user: toJson(user)});
        done(null, { userId: user.id, loginProvider: 'facebook' });
      }
    });
  } else if (profile.provider && profile.UserSSN) {
      models.User.serializeSamlUser(profile, function (error, user) {
        if (error) {
          log.error("Error in User Serialized from SAML", {err: error });
          done(error);
        } else {
          log.info("User Serialized Connected to SAML", { context: 'loginFromSaml', user: toJson(user)});
          done(null, { userId: user.id, loginProvider: 'saml' });
        }
      });
  } else {
    log.info("User Serialized", { profile: profile, context: 'deserializeUser', userEmail: profile.email, userId: profile.id });
    done(null, { userId: profile.id, loginProvider: 'email' } );
  }
});

passport.deserializeUser(function(sessionUser, done) {
  models.User.find({
    where: { id: sessionUser.userId },
    attributes: ["id", "name", "email", "facebook_id", "twitter_id", "google_id", "github_id", "ssn"],
    include: [
      {
        model: models.Image, as: 'UserProfileImages',
        required: false
      },
      {
        model: models.Image, as: 'UserHeaderImages',
        required: false
      }
    ]
  }).then(function(user) {
    if (user) {
      log.info("User Deserialized", { context: 'deserializeUser', user: user.email});
      user.loginProvider = sessionUser.loginProvider;
      done(null, user);
    } else {
      log.error("User Deserialized Not found", { context: 'deserializeUser' });
      /*
      airbrake.notify("User Deserialized Not found", function(airbrakeErr, url) {
        if (airbrakeErr) {
          log.error("AirBrake Error", { context: 'airbrake', user: toJson(req.user), err: airbrakeErr, errorStatus: 500 });
        }
        done(null, false);
      });*/
    }
  }).catch(function(error) {
    log.error("User Deserialize Error", { context: 'deserializeUser', user: id, err: error, errorStatus: 500 });
    /*
    airbrake.notify(error, function(airbrakeErr, url) {
      if (airbrakeErr) {
        log.error("AirBrake Error", { context: 'airbrake', user: toJson(req.user), err: airbrakeErr, errorStatus: 500 });
      }
      done(null, false);
    });
    */
  });
});

console.log("Getting ready 1");

app.use('/api/news_items', newsItems);

console.log("Getting ready 2");

/*
app.use(function(err, req, res, next) {
  if (err instanceof auth.UnauthorizedError) {
    log.error("User Unauthorized", { context: 'unauthorizedError', user: toJson(req.user), err: 'Unauthorized', errorStatus: 401 });
    res.sendStatus(401);
  } else {
    next(err);
  }
});
*/
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  log.warn("Not Found", { context: 'notFound', user: toJson(req.user), err: 'Not Found', errorStatus: 404 });
  next(err);
});

// Error handlers
app.use(function(err, req, res, next) {
  var status = err.status || 500;
  res.status(status);
  if (status==404) {
    log.warn("Not found", { context: 'notFound', errorStatus: status, url: req.url });
  } else {
    log.error("General Error", { context: 'generalError', user: toJson(req.user), err: err, errStack: err.stack, errorStatus: status });
  }
  err.url = req.url;
  err.params = req.params;
  if (status!=404) {
    airbrake.notify(err, function(airbrakeErr, url) {
      if (airbrakeErr) {
        log.error("AirBrake Error", { context: 'airbrake', user: toJson(req.user), err: airbrakeErr, errorStatus: 500 });
      }
      res.send({
        message: err.message,
        error: err
      });
    });
  } else {
    res.send({
      message: err.message,
      error: err
    });
  }
});

console.log("Getting ready!");

var server = app.listen(app.get('port'), function() {
  debug('Active Citizen Dashboard server listening on port ' + server.address().port);
});

module.exports = app;
