var express = require('express');
var session = require('express-session');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var models = require('./models/models');
var routes = require('./routes/index');
var auth = require('./routes/auth');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var _ = require('underscore');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


// Passport stuff here



// Session info here
app.use(session({
  secret:"process.env.SECRET",

  name:"Catscookie",

  store: new MongoStore({mongooseConnection:mongoose.connection}),

  proxy:true,

  resave:true,

  saveUnintialized:true
}));



// Initialize Passport

app.use(passport.initialize());

app.use(passport.session());
// Passport Serialize
passport.serializeUser(function(user,done){
  done(null,user._id);
});

// Passport Deserialize

passport.deserializeUser(function(id,done){
  models.User.findById(id,function(err,user){
    done(err,user);
  });
});
// Passport Strategy


passport.use(new LocalStrategy(function(email,password,done){
  models.User.findOne({email:email},function(err,user){
    if(err){
      console.log(err);
      return done(err);
    }
    if(!user){
      console.log(user);
      return done(null,false,{message:'Incorrect email'});
    }
    return done(null,user);
  });
}));

app.use('/', auth(passport));
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
