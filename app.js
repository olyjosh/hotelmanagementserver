var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var config = require('./bin/config');

var routes = require('./routes/index');


var app = express();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://localhost/green');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


var m = config.mongo;

mongoose.connect(m.uri, {
//  db: { native_parser: true },
//  server: { poolSize: 5 },
//  replset: { rs_name: 'myReplicaSetName' },
  user: m.user,
  pass: m.pass
});

var User = require('./model/user');

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { status:0, message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { status:0, message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

path = require('path');
global.appRoot = path.resolve(__dirname);
var imgDir = global.appRoot+'/res/images/profile_images/';

app.use('/', routes); 


app.post('/api/reg', function (req, res) {
    var respon={status:0};
    var email = req.body.email;
    var first = req.body.firstName;
    var last = req.body.lastName;
    var pass = req.body.password;
    var phone = req.body.phone;

    var User = require('./model/user');
// create a new user called chris
    var chris = new User({
        name : { firstName:first, lastName: last},
        email: email,
        phone: phone,
        password: pass

    });
// call the built-in save method to save to the database
    chris.save(function (err) {
        if (err){
            throw err;
        }

        console.log('User saved successfully!');
        respon={status:1};
        res.send(JSON.stringify(respon));
    });
    
});


app.post('/api/auth/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({status:0 ,message: 'Please fill out all fields'});
  }
  
  var User = require('./model/user');
  var user = new User();

//var email = req.body.email;
//    var first = req.body.firstName;
//    var last = req.body.lastName;
//    var pass = req.body.password;
//    var phone = req.body.phone;
    
    
  user.username = req.body.username;
  user.name.firstName =req.body.firstName;
  user.name.lastName = req.body.lastName;
  user.email = req.body.email;
  user.phone = req.body.phone;

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ 
        return next(err); 
    }

    return res.json({status:1, token: user.generateJWT()})
  });
});


app.post('/api/auth/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({status:1 ,token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

app.get('/api/post', function (req, res) {
    var respon = {status: 0};
    var user = req.query.user;
    var postVar = require('./model/post');
    postVar.find({username : user}, function (err, posts) {
        if (err){
            throw err;
    }
        respon = {status: 1, posts: posts};
        res.send(JSON.stringify(respon));
    });

});

app.get('/api/postAll', function (req, res) {
    var respon = {status: 0};
    var user = req.query.user;
    var postVar = require('./model/post');
    postVar.find({}, function (err, posts) {
        if (err){
            throw err;
    }
        respon = {status: 1, posts: posts};
        res.send(JSON.stringify(respon));
    });

});

app.post('/api/post', function (req, res) {
    var respon={status:0};
    //var email = "olyjoshone@gmail.com";

    var Post = require('./model/post');
    console.log("\n\n\n The images here");
    console.log(req.body.image);
    var postVar = new Post({
        email: "olyjoshone@gmail.com",
        product: req.body.product,
        type: req.body.type,
        location: req.body.location,
        description: req.body.description,
        price: req.body.price,
        images: req.body.images,
        negotiable: req.body.negotiable

    });
    
// call the built-in save method to save to the database
    postVar.save(function (err,post) {
        if (err){
            //throw err;
        }
        console.log('Post saved successfully!');
        respon={status:1, post_id:post._id};
        res.send(JSON.stringify(respon));
    });
});



//The blog posting code starts here
app.post('/api/createBlogPost', function (req, res) {
    var respon={status:0};
    
    var title = req.body.title;
    var pos = req.body.post;
    var Post = require('./model/blogPost');
    var postVar = new Post({
        title: title,
        post: pos,
        author: "Olyjosh"// new to change this to the name of the user in session when I have been able to work with session
    });
    
    postVar.save(function (err,post) {
        if (err){
            //throw err;
        }
        
        respon={status:1, post:post};
        console.log(post);
        res.send(JSON.stringify(respon));
    });
    
    
});

// read blog post here soon


app.post('/api/deleteBlogPost', function (req, res) {

    var respon={status:0};

    var postid = req.body.id;

    var Post = require('./model/blogPost');
    
    Post.find({ id:postid }).remove( function(err){
        if (err)
                throw err
        console.log('DELETED');
        respon={status:1};
        res.send(JSON.stringify(respon));
    })
    
});

app.post('/api/editBlogPost', function (req, res) {
    var respon = {status: 0};
    var Post = require('./model/blogPost');
// call the built-in save method to save to the database
    console.log(req.body)
    var Post = require('./model/blogPost');
    var postVar = new Post({
        title: req.body.title,
        status: req.body.post
    });

    var upsertData = postVar.toObject();

// Delete the _id property, otherwise Mongo will return a "Mod on _id not allowed" error
    delete upsertData._id;

    Post.update({_id: postVar.id}, upsertData, {upsert: true}, function(err){
        if (err)
                throw err
            //return res.send(500, {error: err});
        respon = {status: 1, posts: doc};
        res.send(JSON.stringify(respon));
    });


});

app.get('/api/readBlogPost', function (req, res) {
    var respon = {status: 0};
    var postVar = require('./model/blogPost');
    postVar.find({}, function (err, posts) {
        if (err){
            throw err;
    }
        respon = {status: 1, posts: posts};
        res.send(JSON.stringify(respon));
    });

});




//The blog post code stop here


//SErve images
app.get('/api/static/image', function (req, res) {
    var respon = {status: 0};
    
    console.log(req.query);
    var image = req.query.imageId;
    console.log(imgDir+image);
    res.sendFile(imgDir+image,{maxAge:'5000'},function(){
        
    });
});

app.get('api/user/:uid/photos/:file', function (req, res) {
    console.log(req.params.uid);
    console.log(req.params.file);
    
//    var uid = req.params.uid, file = req.params.file;
//    req.user.mayViewFilesFrom(uid, function (yes) {
//        if (yes) {
//            res.sendFile('/uploads/' + uid + '/' + file);
//        } else {
//            res.send(403, 'Sorry! you cant see that.');
//        }
//    });
});



var upload = require('./upload')
app.route('/upload/image')
    .post(upload.postImage);


app.get('/api/login', function (req, res) {
//
//    var email = req.param('email');
//    var first = req.param('firstName');
//    var last = req.param('lastName');
//    var pass = req.param('pass');
//    var phone = req.param('phone')

    var email = req.body.email;
    var first = req.body.firstName;
    
    
//var User = require('./model/user');
//// create a new user called chris
//    var chris = new User({
//        firstName: first,
//        lastName : last,
//        email : email,
//        phone: phone,
//        password: pass
//        
//    });
//// call the built-in save method to save to the database
//    chris.save(function (err) {
//        if (err)
//            throw err;
//
//        console.log('User saved successfully!');
//    });
    res.send(req.body);
});

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