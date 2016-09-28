var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var config = require('./bin/config');
var routes = require('./routes/index');
var doc = require('./routes/doc');


var app = express();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://localhost/green');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var jwt = require('jsonwebtoken');

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
    User.findOne({ 'name.username': username }, function (err, user) {
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
app.use('/doc',doc);


var verifyAuth = function (req, res, next) {
//    console.log(JSON.stringify(req.headers.token));
    if (req.url.startsWith("/api/op/")) {
        var token = req.headers.token; //"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1N2RlY2E1ZDM1ZmI5YTQ4N2JkZWI3MGYiLCJlbWFpbCI6Im9seWpvc2hvbmVAZ21haWwuY29tIiwibmFtZSI6eyJ1c2VybmFtZSI6ImFkbWluIiwiZmlyc3ROYW1lIjoiQWRtaW4iLCJsYXN0TmFtZSI6IkFkbWluIn0sImV4cCI6MTQ3NDgyMzM4OSwiaWF0IjoxNDc0MjE4NTg5fQ.bJIh7STXSMU2o4qNuG4SrsPlK4wYL2JeGvXZxgKM_Os";
        jwt.verify(token, 'MY_SECRET'  //    app.get('MY_SECRET')
                , function (err, decoded) {
                    if (err) {
                        // Failed token
                        res.status(401);
                        return res.json({status: 0, message: 'Invalid authentication, Please login'});
                    } else {
                        //Proceed with the operations
                        // You can also do stuff with the decoded token
                        next();
                    }
                });
    }else{
        next();
    }
}

app.use(verifyAuth); 
var k = require('./model/const');

/**
 *  Create user(staff registeration), login  authentication
 * */

app.post('/api/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({status:0 ,message: 'Please fill out all fields'});
  }
  
  var User = require('./model/user');
  var user = new User();

  user.name.username = req.body.username;
  user.name.firstName =req.body.firstName;
  user.name.lastName = req.body.lastName;
  user.email = req.body.email;
  user.phone = req.body.phone;
  var staff = req.body.isStaff;
  if(staff){
      user.staff.isStaff = true;
      user.staff.staffId = "00001"
      user.privilege = req.body.privilege
  }else{
      user.staff.isStaff = false;
  }
  user.sex = req.body.sex;
  user.dob = req.body.dob;
  user.country = req.body.country;

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ 
        return next(err); 
    }

    return res.json({status:1, token: user.generateJWT()})
  });
});


app.post('/api/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      delete user.hash;
      
      return res.json({status:1 ,token: user.generateJWT(), user : user});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

/************************************************************
 * Room , room type and floor
 */

app.get('/api/op/create/room', function (req, res, next) {
    var Facility = require('./model/facility');
    var fac = new Facility();
    var q = req.query;

    fac.alias = q.alias;
    fac.name = q.name;
    fac.desc = q.desc;
    fac.roomType = q.roomType;
    fac.floor = q.floor;
    fac.roomStatus.state = q.roomStatus_state; /* Can be any of dirty, disOrder, ok*/
    fac.roomStatus.bookedStatus = q.roomStatus_bookedStatus; /* booked, reserved, checkedIn, checkedOut none*/

    fac.save(function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status: 1, message: data})
    });
});

//app.get('/api/op/fetch/room', function(req, res, next){
//  var Colle = require('./model/facility');
//
//    Colle.find({}, function (err, data) {
//        if (err) {
//            return next(err);
//        }
//        return res.json({status:1, message : data});
//    });
//    
//});

app.get('/api/op/fetch/room', function(req, res, next){
  var Colle = require('./model/facility');
    Colle.find().populate('floor','roomType').exec( function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status:1, message : data});
    });
    
});

app.get('/api/op/fetch/vacantroom', function(req, res, next){
  var q= req.query;
//  var d1 = q.d1;
//  var d2 =q.d2
 // "roomStatus.bookedStatus":k.RM_VACANT , 
  var Colle = require('./model/facility');
    Colle.find(
            {$and:[{"roomStatus.bookedStatus":k.RM_VACANT},{"roomStatus.state":{ $ne: k.RM_DISORDER }}]}).populate('floor','roomType').exec( function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status:1, message : data});
    });
});

app.get('/api/op/fetch/outoforder', function(req, res, next){
  var q= req.query;
//  var d1 = q.d1;
//  var d2 =q.d2
 // "roomStatus.bookedStatus":k.RM_VACANT , 
  var Colle = require('./model/facility');
    Colle.find({"roomStatus.state" : k.RM_DISORDER}).exec( function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status:1, message : data});
    });
});

app.get('/api/op/edit/outoforder', function(req, res, next){
  var q= req.query;
  changeRoomState(q.id, q.status, function(data){
        return res.json({status:1, message : data});
    });
});



app.get('/api/op/fetch/roomstay', function(req, res, next){
  var q= req.query;
    var Colle = require('./model/booking');
    Colle.find(
            {$and:[{checkIn :{$gte:q.d1}},{checkOut:{ $lte: q.d2 }}]}).populate('floor','roomType').exec( function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status:1, message : data});
    });
    
});



app.get('/api/op/edit/room', function(req, res, next){
    
});

app.get('/api/op/delete/room', function(req, res, next){
    var id = req.query.id;
    var Post = require('./model/facility');

    Post.find({id: id}).remove(function (err) {
        if (err)
            throw err
//        respon = {status: 1};
//        res.send(JSON.stringify(respon));
        return res.json({status:1, message : data});
    })
});


//floors
app.get('/api/op/create/floor', function (req, res, next) {

    var Floor = require('./model/floors');
    var floor = new Floor();
    floor.alias = req.query.alias;
    floor.name = req.query.name;
    floor.desc = req.query.desc;
    console.log(req.query);

    floor.save(function (err, data) {
        if (err) {
            return next(err);
            return error.stack;
console.log(error.stack);
        }
        return res.json({status: 1, message: data});
    });
});

app.get('/api/op/fetch/floor', function(req, res, next){
    var Floor = require('./model/floors');
    Floor.find({}, function (err, data) {
        if (err) {
//            throw err;
            return next(err);
        }
        return res.json({status:1, message : data});
//        respon = {status: 1, posts: posts};
//        res.send(JSON.stringify(respon));
    });
});

app.get('/api/op/edit/floor', function(req, res, next){
  
});

app.get('/api/op/delete/floor', function (req, res, next) {
    var floorId = req.query.id;
    var Post = require('./model/floors');

    Post.find({id: floorId}).remove(function (err) {
        if (err)
            throw err
        respon = {status: 1};
        res.send(JSON.stringify(respon));
    })
});

/* 
 * roomType stuffs 
 * */
app.get('/api/op/create/roomtype', function(req, res, next){
   
    var RoomType = require('./model/roomType');
    var roomType = new RoomType();
    var q = req.query;
    
    roomType.alias = q.alias;
    roomType.name = q.name;
    roomType.desc = q.desc;

    roomType.rate.rate = q.rate_rate;
    roomType.rate.adult = q.rate_adult;
    roomType.rate.child = q.rate_child;
    roomType.rate.overBookingPercentage = q.rate_overBookingPercentage;

    roomType.pax.baseAdult = q.pax_baseAdult;
    roomType.pax.baseChild = q.pax_baseChild;
    roomType.pax.maxAdult = q.pax_maxAdult;
    roomType.pax.maxChild = q.pax_maxChild
    roomType.displayColor = q.color

    roomType.save(function (err, data) {
        if (err) { 
        return next(err); 
    }
    return res.json({status:1, message : data});
  });
});

app.get('/api/op/fetch/roomtype', function(req, res, next){
    var Collec = require('./model/roomType');
    Collec.find({}, function (err, data) {
        if (err) {
//            throw err;
            return next(err);
        }
        return res.json({status:1, message : data});
    });
});

app.get('/api/op/edit/roomtype', function(req, res, next){
    
});

app.get('/api/op/delete/roomtype', function (req, res, next) {
    var id = req.query.id;
    var Collec = require('./model/roomType');

    Collec.find({id: id}).remove(function (err) {
        if (err)
            throw err
        respon = {status: 1};
        res.send(JSON.stringify(respon));
    })
});


/************************************************************
 * Booking reservation and checkin
 */
app.get('/api/op/create/book', function(req, res, next){
   
    var Book = require('./model/booking');
    var book = new Book();
    var q = req.query;
    book.status = q.status;
    book.room = q.room;
//    var customer = q.customer;
//    if (customer != null) {
//        book.customer = customer;
//    }
    book.channel = q.channel; /* any of online, web, frontDesk*/
    book.performedBy = q.performedBy;
    book.amount = q.amount;
    
    book.checkIn = q.checkIn;
    book.checkOut = q.checkOut;
    var che = q.isCheckIn;

    book.arrival=book.checkIn;
    if (che==="true") {
        book.isCheckIn = true;
        
    }
//    book.guestId = q.phone;
    book.guest.firstName = q.firstName;
    book.guest.lastName = q.lastName;
    book.guest.phone = q.phone;
    

    createGuest (q);
    changeRoomBookStatus(q.room, q.status,function(data){});
    
    book.save(function (err, data) {
        if (err) { 
        return next(err); 
    }
    return res.json({status:1, message : data});
  });
});

changeRoomState= function(id,status,callback){
    var Fac = require('./model/facility');
    var fac = new Fac();
    fac.roomStatus.state  = status;
    Fac.findByIdAndUpdate(id, {"roomStatus.state": status}, function (err, data) {
        if (err) {
//            return next(err);
            console.log();
        }
        return callback(data);
    });
}

changeRoomBookStatus= function(id,status,callback){
    var Fac = require('./model/facility');
    var fac = new Fac();
    fac.roomStatus.bookedStatus = status;
//    Lists.findByIdAndUpdate(listId, {$push: , function(err, list) {
//    ...
//    });
    // This update will return updated data
    Fac.findByIdAndUpdate(id, {"roomStatus.bookedStatus": status}, function (err, data) {
        if (err) {
            return next(err);
            //console.log();
        }
        
        return callback(data);
    });
}


var createGuest = function (q) {
        
    var Guest = require('./model/guest');
    var gue = new Guest();
    gue.name.lastName = q.lastName;
    gue.name.firstName = q.firstName;
    gue.email = q.email;
    gue.phone = q.phone;
    gue.address = q.address;
    
//    gue.save({ upsert : true },function (err, data) {
//        if (err) {
//            return next(err);
//        }
//    });
//    var ret;
    return Guest.findOneAndUpdate({ phone: q.phone }, gue.toObject(), { upsert : true }, function (err, data) {
        if (err) {
//            return next(err);
            console.log();
        }
        console.log(data);
        return data;
    });
//    return ret;
}

app.get('/api/op/fetch/book', function(req, res, next){
    var Collec = require('./model/booking');
    Collec.find({}).populate('room').exec(function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status:1, message : data});
//        respon = {status: 1, posts: posts};
//        res.send(JSON.stringify(respon));
    });
});

app.get('/api/op/edit/book', function(req, res, next){
  
});

app.get('/api/op/create/checkin', function(req, res, next){
  var q = req.query;
  var Collec = require('./model/booking');
  var book = new Collec();
  book.isCheckIn = true;
  book.arrival = q.arrival;
  
    Collec.findByIdAndUpdate(q.id, {$push: {isCheckIn: true, arrival: q.arrival}}, function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status: 1, message: data});
    });

});

app.get('/api/op/delete/book', function (req, res, next) {
    var id = req.query.id;
    var Collec = require('./model/booking');

    Collec.find({_id: id}).remove(function (err) {
        if (err)
            throw err
        respon = {status: 1};
        res.send(JSON.stringify(respon));
    })
});

app.get('/api/op/cancel/book', function(req, res, next){
    
});


/************************************************************
 * Guest list and Guest Messages
 * 
 */
app.get('/api/op/fetch/guests', function(req, res, next){
    var Collec = require('./model/guest');
    //isCheckIn : false,
    Collec.find({$and: [ {isCheckIn: true },{ "staff.isStaff":false}]}, function (err, data) {
        if (err) {
//            throw err;
            return next(err);
        }
        return res.json({status:1, message : data});
//        respon = {status: 1, posts: posts};
//        res.send(JSON.stringify(respon));
    });
});

app.get('/api/op/fetch/customers', function(req, res, next){
    var Collec = require('./model/guest');
    //isCheckIn : false,
    Collec.find({}, function (err, data) {
        if (err) {
//            throw err;
            return next(err);
        }
        return res.json({status:1, message : data});
//        respon = {status: 1, posts: posts};
//        res.send(JSON.stringify(respon));
    });
});


app.get('/api/op/fetch/message', function(req, res, next){
    var Collec = require('./model/message');
    //isCheckIn : false,
    var q = req.query;
    var phone = q.phone;
    Collec.find({$or: [ {from: phone },{ to:phone}]}, function (err, data) {
        if (err) {
//            throw err;
            return next(err);
        }
        return res.json({status:1, message : data});

    });
});

app.get('/api/op/create/message', function(req, res, next){
   
    var Message = require('./model/message');
    var msg = new Message();
    var q = req.query;
    msg.from = q.from;
    msg.to = q.to;
    msg.message = q.message;
    msg.save(function (err, data) {
        if (err) { 
        return next(err); 
    }
    return res.json({status:1, message : data});
  });
});

/************************************************************
 * Laundry
 */

app.get('/api/op/create/laundryitem', function (req, res, next) {
    var Coll = require('./model/laundryItem');
    var c = new Coll();
    var q = req.query;
    c.alias=q.alis;
    c.name=q.name;
    c.code=q.code;
    c.category=q.category;
    c.visibility=q.visibility;
    c.itemImage=q.itemImage;
    c.desc=q.desc;
    c.performedBy = q.performedBy;
    c.save(function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status: 1, message: data})
    });
});

app.get('/api/op/fetch/laundryitem', function(req, res, next){
  var Colle = require('./model/laundryItem');
    Colle.find().exec( function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status:1, message : data});
    });
});


app.get('/api/op/delete/laundryitem', function(req, res, next){
    var Collec = require('./model/laundryItem');
    Collec.find({_id: req.query.id}).remove(function (err) {
        if (err)
            throw err
        respon = {status: 1};
        res.send(JSON.stringify(respon));
    })
    
});

app.get('/api/op/edit/laundryitem', function(req, res, next){
    var Collec = require('./model/laundryItem');
    var c = new Coll();
    var q = req.query;
    c.alias=q.alis;
    c.name=q.name;
    c.code=q.code;
    c.category=q.category;
    c.visibility=q.visibility;
    c.itemImage=q.itemImage;
    c.desc=q.desc;
    c.performedBy = q.performedBy;
    
    Collec.findOneAndUpdate({ _id: q.id }, c.toObject(), function (err, data) {
        if (err) {
//            return next(err);
            console.log();
        }
        console.log(data);
        return data;
    });
});



app.get('/api/op/create/service', function (req, res, next) {
    var q = req.query;    
    var Coll = require('./model/service');
    var c = new Coll();
    
    c.alias=q.alis;
    c.name=q.name;
    c.extraCharge=q.extraCharge;
    c.desc=q.desc;
    c.image=q.image;
    c.service =  q.service;
    c.performedBy = q.performedBy;
    c.save(function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status: 1, message: data})
    });
});

app.get('/api/op/fetch/service', function(req, res, next){
    var q = req.query; 
    
    var query = {};
    if(q.service!==null)query={service:q.service};
  var Colle = require('./model/service');
    Colle.find(query).exec( function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status:1, message : data});
    });
});


app.get('/api/op/delete/service', function(req, res, next){
    var Collec = require('./model/service');
    Collec.find({_id: req.query.id}).remove(function (err) {
        if (err)
            throw err
        respon = {status: 1};
        res.send(JSON.stringify(respon));
    })
    
});

app.get('/api/op/edit/service', function(req, res, next){
    var Collec = require('./model/service');
    var c = new Coll();
    var q = req.query;
    c.alias=q.alis;
    c.name=q.name;
    c.extraCharge=q.extraCharge;
    c.desc=q.desc;
    c.image=q.image;
    c.service =  q.service;
    c.performedBy = q.performedBy;
    
    Collec.findOneAndUpdate({ _id: q.id }, c.toObject(),  function (err, data) {
        if (err) {
//            return next(err);
            console.log();
        }
        console.log(data);
        return data;
    });
});

app.get('/api/op/create/returnin', function (req, res, next) {
    var Coll = require('./model/returnIn');
    var c = new Coll();
    var q = req.query;
   
    c.alias=q.alis;
    c.name=q.name;
    c.extraCharge=q.extraCharge;
    c.desc=q.desc;
    c.image=q.image;
    c.performedBy = q.performedBy;
    c.save(function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status: 1, message: data})
    });
});

app.get('/api/op/fetch/returnin', function(req, res, next){
  var Colle = require('./model/returnIn');
    Colle.find().exec( function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status:1, message : data});
    });
});


app.get('/api/op/delete/returnin', function(req, res, next){
    var Collec = require('./model/returnIn');
    Collec.find({_id: req.query.id}).remove(function (err) {
        if (err)
            throw err
        respon = {status: 1};
        res.send(JSON.stringify(respon));
    })
    
});

app.get('/api/op/edit/returnin', function(req, res, next){
    var Collec = require('./model/returnIn');
    var c = new Coll();
    var q = req.query;
    c.alias=q.alis;
    c.name=q.name;
    c.extraCharge=q.extraCharge;
    c.desc=q.desc;
    c.image=q.image;
    c.performedBy = q.performedBy;
    
    Collec.findOneAndUpdate({ _id: q.id }, c.toObject(),  function (err, data) {
        if (err) {
//            return next(err);
            console.log();
        }
        console.log(data);
        return data;
    });
});




app.get('/api/op/create/dailylaundry', function (req, res, next) {
    var Coll = require('./model/dailyLaundry');
    var c = new Coll();
    var q = req.query;
    
    c.sn=q.sn;
    c.date=q.date;
    c.item=q.item;
    c.user=q.user;
    c.status=q.image;
    c.laundryService=q.laundryService;
    c.hotelService=q.hotelService;
    c.returnIn=q.returnIn;
    c.returned=q.returned;
    c.bill=q.bill;
    c.amonunt=q.amonunt;
    c.balance=q.balance;
    c.remark=q.remark;
    c.performedBy = q.performedBy;
    c.save(function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status: 1, message: data})
    });
});

app.get('/api/op/fetch/dailylaundry', function(req, res, next){
  var Colle = require('./model/dailyLaundry');
    Colle.find().exec( function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status:1, message : data});
    });
});


app.get('/api/op/delete/dailylaundry', function(req, res, next){
    var Collec = require('./model/dailyLaundry');
    Collec.find({_id: req.query.id}).remove(function (err) {
        if (err)
            throw err
        respon = {status: 1};
        res.send(JSON.stringify(respon));
    })
    
});

app.get('/api/op/edit/dailylaundry', function(req, res, next){
    var Collec = require('./model/dailyLaundry');
    var c = new Coll();
    var q = req.query;
    c.sn=q.sn;
    c.date=q.date;
    c.item=q.item;
    c.user=q.user;
    c.status=q.image;
    c.laundryService=q.laundryService;
    c.hotelService=q.hotelService;
    c.returnIn=q.returnIn;
    c.returned=q.returned;
    c.bill=q.bill;
    c.amonunt=q.amonunt;
    c.balance=q.balance;
    c.remark=q.remark;
    c.performedBy = q.performedBy;
    
    Collec.findOneAndUpdate({ _id: q.id }, c.toObject(), function (err, data) {
        if (err) {
//            return next(err);
            console.log();
        }
        console.log(data);
        return data;
    });
});






















//app.get('/api/post', function (req, res) {
//    var respon = {status: 0};
//    var user = req.query.user;
//    var postVar = require('./model/post');
//    postVar.find({username : user}, function (err, posts) {
//        if (err){
//            throw err;
//    }
//        respon = {status: 1, posts: posts};
//        res.send(JSON.stringify(respon));
//    });
//
//});
//
//
//
//app.get('/api/postAll', function (req, res) {
//    var respon = {status: 0};
//    var user = req.query.user;
//    var postVar = require('./model/post');
//    postVar.find({}, function (err, posts) {
//        if (err){
//            throw err;
//    }
//        respon = {status: 1, posts: posts};
//        res.send(JSON.stringify(respon));
//    });
//
//});
//
//app.post('/api/post', function (req, res) {
//    var respon={status:0};
//    //var email = "olyjoshone@gmail.com";
//
//    var Post = require('./model/post');
//    console.log("\n\n\n The images here");
//    console.log(req.body.image);
//    var postVar = new Post({
//        email: "olyjoshone@gmail.com",
//        product: req.body.product,
//        type: req.body.type,
//        location: req.body.location,
//        description: req.body.description,
//        price: req.body.price,
//        images: req.body.images,
//        negotiable: req.body.negotiable
//
//    });
//    
//    
//    
//// call the built-in save method to save to the database
//    postVar.save(function (err,post) {
//        if (err){
//            //throw err;
//        }
//        console.log('Post saved successfully!');
//        respon={status:1, post_id:post._id};
//        res.send(JSON.stringify(respon));
//    });
//});
//
//
//
////The blog posting code starts here
//app.post('/api/createBlogPost', function (req, res) {
//    var respon={status:0};
//    
//    var title = req.body.title;
//    var pos = req.body.post;
//    var Post = require('./model/blogPost');
//    var postVar = new Post({
//        title: title,
//        post: pos,
//        author: "Olyjosh"// new to change this to the name of the user in session when I have been able to work with session
//    });
//    
//    postVar.save(function (err,post) {
//        if (err){
//            //throw err;
//        }
//        
//        respon={status:1, post:post};
//        console.log(post);
//        res.send(JSON.stringify(respon));
//    });
//});
//
//// read blog post here soon
//
//
//app.post('/api/deleteBlogPost', function (req, res) {
//
//    var respon={status:0};
//    var postid = req.body.id;
//    var Post = require('./model/blogPost');
//    
//    Post.find({ id:postid }).remove( function(err){
//        if (err)
//                throw err
//        console.log('DELETED');
//        respon={status:1};
//        res.send(JSON.stringify(respon));
//    });
//    
//});
//
//app.post('/api/editBlogPost', function (req, res) {
//    var respon = {status: 0};
//    var Post = require('./model/blogPost');
//// call the built-in save method to save to the database
//    console.log(req.body)
//    var Post = require('./model/blogPost');
//    var postVar = new Post({
//        title: req.body.title,
//        status: req.body.post
//    });
//
//    var upsertData = postVar.toObject();
//
//// Delete the _id property, otherwise Mongo will return a "Mod on _id not allowed" error
//    delete upsertData._id;
//
//    Post.update({_id: postVar.id}, upsertData, {upsert: true}, function(err){
//        if (err)
//                throw err
//            //return res.send(500, {error: err});
//        respon = {status: 1, posts: doc};
//        res.send(JSON.stringify(respon));
//    });
//
//
//});
//
//app.get('/api/readBlogPost', function (req, res) {
//    var respon = {status: 0};
//    var postVar = require('./model/blogPost');
//    postVar.find({}, function (err, posts) {
//        if (err){
//            throw err;
//    }
//        respon = {status: 1, posts: posts};
//        res.send(JSON.stringify(respon));
//    });
//
//});
//
//


//The blog post code stop here


//SErve images
app.get('/api/op/static/image', function (req, res) {
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