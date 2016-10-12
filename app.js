var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var rem = require('./reminders');

var config = require('./bin/config');
var routes = require('./routes/index');
var doc = require('./routes/doc');


var app = express();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//mongoose.connect('mongodb://localhost/green');

var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var jwt = require('jsonwebtoken');

var upload = require('./upload');
global.appRoot = path.resolve(__dirname);
var imgDir = global.appRoot+'/res/images/upload/';
var k = require('./model/const');  // some useful constants


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


app.use('/', routes); 
app.use('/doc',doc);



var verifyAuth = function (req, res, next) {
    if (req.url.startsWith("/api/op/")) {
        var token = req.headers.token; 
        jwt.verify(token, 'MY_SECRET'  //    app.get('MY_SECRET')
                , function (err, decoded) {
                    if (err) {
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
app.use(verifyAuth); // Using the inteception created above



/*******************************************************************************
 *  Create user(staff registeration), login  authentication
 *
 ******************************************************************************/

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
      user.staff.staffId = "00002"
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
      //delete user.hash;
      login(user._id, true);
      return res.json({status:1 ,token: user.generateJWT(), user : user});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

app.get('/api/op/logout', function(req, res, next){
    login(req.query.id, false);
    return res.json({status:1});
});

login= function(id,status){
    var Coll = require('./model/logins');
    var c = new Coll();
    c.login=status;
    c.user=id;  // this is the user I'm login or logout
    c.save(function (err, data) {
        if (err) {
            return next(err);
        }
//        return callback(true);
    });
}

app.get('/api/op/fetch/staff', function(req, res, next){
  var Colle = require('./model/user');
  var q = req.query;
  var arg = {};
  if(q.privilege!==null)arg={privilege:q.privilege};
    Colle.find(arg).select('-hash -salt -__v').exec( function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status:1, message : data});
    });
    
});


//StaffComments
app.get('/api/op/fetch/staffcomments', function(req, res, next){
  var Colle = require('./model/staffComments');
  var q = req.query;
  Colle.find({staff:q.id}).populate('performedBy','name').exec( function (err, data) {
//  Colle.find({staff: q.id}).populate({path: 'performedBy',select: '-hash -_id',}).exec(function (err, data) {
            
        if (err) {
            return next(err);
        }
        return res.json({status:1, message : data});
    });
    
});

app.get('/api/op/create/staffcomments', function(req, res, next){
  var Coll = require('./model/staffComments');
    var c = new Coll();
    var q = req.query;
    c.staff=q.staff;
    c.comment=q.comment;
    c.performedBy = q.performedBy;
    c.save(function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status: 1, message: data})
    });
    
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
    Colle.find({}).populate('floor').populate('roomType').exec( function (err, data) {
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
            {$and:[{checkIn :{$gte:q.d1}},{checkOut:{ $lte: q.d2 }}]}).populate('room').exec( function (err, data) {
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
    recordTrans(q.status+ ' ',q.amount,0,0,q.amount,book.guest,q.performedBy);
//    (desc,amount,discount,tax,total,paid,guest,performedBy)

    createGuest (q);
    changeRoomBookStatus(q.room, q.status,function(data){});
    
    book.save(function (err, data) {
        if (err) { 
        return next(err); 
    }
    return res.json({status:1, message : data});
  });
});


/*******************************************************************************
 *  Some cool functions going down here.
 *  Transaction recording, folios bla bla 
 ******************************************************************************/

recordTrans = function (desc,amount,discount,tax,total,paid,guest,performedBy){
//  desc: String,
//  amount: Number,
//  discount : Number,
//  tax : Number,    // Should be 0 if it's just a payment on 
//  total : Number,
//  paid : Number, // the amount paid yet
//  //balance : Number,  // projection will do this
//  guest : {
//      firstName : String,
//      lastName : String ,
//      phone : String,
//  },

    var Coll = require('./model/transaction');
    var c = new Coll();
    c.desc=desc;
    c.amount=amount;
    c.discount=discount;
    c.tax=tax;
    c.total=total;
    c.paid=paid;
    c.guest=guest;
    
    c.performedBy = performedBy;
    c.save(function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status: 1, message: data})
    });
    
    
    
}


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


/**************************************************************************
 * 
 * Tool and Utility
 **************************************************************************/

// lost and found, careless owner
app.get('/api/op/create/lostfound', function (req, res, next) {
    var Coll = require('./model/lostFound');
    var c = new Coll();
    var q = req.query;

    c.onDate=q.on;
    c.name=q.name;
    c.color=q.color;
    c.location=q.location;
    c.roomNo=q.roomNo;
    c.current=q.current;
    c.founder=q.founder;
    c.comp.name=q.comp_name;
    c.comp.address=q.comp_address;
    c.comp.city=q.comp_city;
    c.comp.state=q.comp_state;
    c.comp.zip=q.comp_zip;
    c.comp.country=q.comp_country;
    c.comp.phone = q.comp_phone;
    c.reso.returnBy =q.reso_returnBy;
    c.reso.discardBy=q.reso_discardBy;
    c.reso.returnDate = q.reso_returnDate;
    c.reso.discardDate = q.reso_discardDate;
    c.remark = q.remark;
    c.performedBy = q.performedBy;
    
    c.save(function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status: 1, message: data})
    });
});

app.get('/api/op/fetch/lostfound', function(req, res, next){
  var Colle = require('./model/lostFound');
    Colle.find().exec( function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status:1, message : data});
    });
});


app.get('/api/op/delete/lostfound', function(req, res, next){
    var Collec = require('./model/lostFound');
    Collec.find({_id: req.query.id}).remove(function (err) {
        if (err)
            throw err
        respon = {status: 1};
        res.send(JSON.stringify(respon));
    })
    
});

app.get('/api/op/edit/lostfound', function(req, res, next){
    var Collec = require('./model/lostFound');
    var c = new Coll();
    var q = req.query;
        
    c.on=q.on;
    c.name=q.name;
    c.color=q.color;
    c.location=q.location;
    c.roomNo=q.roomNo;
    c.current=q.current;
    c.founder=q.founder;
    c.comp.name=q.comp_name;
    c.comp.address=q.comp_address;
    c.comp.city=q.comp_city;
    c.comp.state=q.comp_state;
    c.comp.zip=q.comp_zip;
    c.comp.country=q.comp_country;
    c.comp.phone = q.comp_phone;
    c.reso.returnBy =q.reso_returnBy;
    c.reso.discardBy=q.reso_discardBy;
    c.reso.returnDate = q.reso_returnDate;
    c.reso.discardDate = q.reso_discardDate;
    c.remark = q.remark;
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

// reminders
app.get('/api/op/create/reminder', function (req, res, next) {
    var Coll = require('./model/reminder');
    var c = new Coll();
    var q = req.query;

    c.name=q.name;
    c.startTime=q.startTime;
    c.priority=q.priority;
    c.message=q.message;
    c.interval=q.interval;
    c.remark=q.remark;
    c.stopAfter=q.stopAfter;
    var reci = q.receivers.split(',');
    c.receivers=reci;

    c.performedBy = q.performedBy;
    
    c.save(function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status: 1, message: data})
    });
});

app.get('/api/op/fetch/reminder', function(req, res, next){
  var Colle = require('./model/reminder');
    Colle.find().exec( function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status:1, message : data});
    });
});


app.get('/api/op/delete/reminder', function(req, res, next){
    var Collec = require('./model/reminder');
    Collec.find({_id: req.query.id}).remove(function (err) {
        if (err)
            throw err
        respon = {status: 1};
        res.send(JSON.stringify(respon));
    })
    
});

app.get('/api/op/edit/reminder', function(req, res, next){
    var Collec = require('./model/reminder');
    var c = new Coll();
    var q = req.query;
        
    c.name=q.name;
    c.startTime=q.startTime;
    c.priority=q.priority;
    c.message=q.message;
    c.interval=q.interval;
    c.remark=q.remark;
    c.stopAfter=q.stopAfter;
    var reci = q.receivers.split(',');
    c.receivers=reci;
    
    Collec.findOneAndUpdate({ _id: q.id }, c.toObject(), function (err, data) {
        if (err) {
//            return next(err);
            console.log();
        }
        console.log(data);
        return data;
    });
});

// account
app.get('/api/op/create/account', function (req, res, next) {
    var Coll = require('./model/account');
    var c = new Coll();
    var q = req.query;

    c.alis=q.alis;
    c.accountName=q.accountName;
    c.accountType=q.accountType;
    c.firstName=q.firstName;
    c.lastName=q.lastName;
    c.address.one=q.address_one;
    c.address.two=q.address_two;
    c.city=q.city;
    c.zip=q.zip;
    c.state=q.state;
    c.country=q.country;
    c.email=q.email;
    c.website=q.website;
    c.rep = q.rep;
    c.cred.accountNo=q.cred_accountNo;
    c.cred.creditLimit=q.cred_creditLimit;
    c.cred.openBalance=q.cred_openBalance;
    c.cred.paymentTerm=q.cred_paymentTerm;
    c.performedBy = q.performedBy;
    
    c.save(function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status: 1, message: data})
    });
});

app.get('/api/op/fetch/account', function(req, res, next){
  var Colle = require('./model/account');
    Colle.find().exec( function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status:1, message : data});
    });
});


app.get('/api/op/delete/account', function(req, res, next){
    var Collec = require('./model/account');
    Collec.find({_id: req.query.id}).remove(function (err) {
        if (err)
            throw err
        respon = {status: 1};
        res.send(JSON.stringify(respon));
    })
    
});

app.get('/api/op/edit/account', function(req, res, next){
    var Collec = require('./model/account');
    var c = new Coll();
    var q = req.query;
        
    c.alis=q.alis;
    c.accountName=q.accountName;
    c.accountType=q.accountType;
    c.firstName=q.firstName;
    c.lastName=q.lastName;
    c.address.one=q.address_one;
    c.address.two=q.address_two;
    c.city=q.city;
    c.zip=q.zip;
    c.state=q.state;
    c.country=q.country;
    c.email=q.email;
    c.website=q.website;
    c.rep = q.rep;
    c.cred.accountNo=q.cred_accountNo;
    c.cred.creditLimit=q.cred_creditLimit;
    c.cred.openBalance=q.cred_openBalance;
    c.cred.paymentTerm=q.cred_paymentTerm;
    c.performedBy = q.performedBy;
    
    var reci = q.receivers.split(',');
    c.receivers=reci;
    
    Collec.findOneAndUpdate({ _id: q.id }, c.toObject(), function (err, data) {
        if (err) {
//            return next(err);
            console.log();
        }
        console.log(data);
        return data;
    });
});

// Phone
app.get('/api/op/create/phone', function (req, res, next) {
    var Coll = require('./model/phone');
    var c = new Coll();
    var q = req.query;

    c.ref = q.ref;
    c.title = q.title;
    c.firstName = q.firstName;
    c.lastName = q.lastName;
    c.gender = q.gender;

    c.contact.mobile = q.contact_mobile;
    c.contact.workPhone = q.contact_workPhone;
    c.contact.residence = q.contact_residence;
    c.contact.email = q.contact.email;
    c.contact.address = q.contact_address;
    c.contact.city = q.contact_city;
    c.contact.state = q.contact_state;
    c.contact.zip = q.contact_zip;
    c.contact.country = q.contact_country;
    c.remarks = q.remarks;
    c.performedBy = q.performedBy;
    
    c.save(function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status: 1, message: data})
    });
});

app.get('/api/op/fetch/phone', function(req, res, next){
  var Colle = require('./model/phone');
    Colle.find().exec( function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status:1, message : data});
    });
});


app.get('/api/op/delete/phone', function(req, res, next){
    var Collec = require('./model/phone');
    Collec.find({_id: req.query.id}).remove(function (err) {
        if (err)
            throw err
        respon = {status: 1};
        res.send(JSON.stringify(respon));
    })
});

app.get('/api/op/edit/phone', function(req, res, next){
    var Collec = require('./model/phone');
    var c = new Coll();
    var q = req.query;
        
    c.ref = q.ref;
    c.title = q.title;
    c.firstName = q.firstName;
    c.lastName = q.lastName;
    c.gender = q.gender;

    c.contact.mobile = q.contact_mobile;
    c.contact.workPhone = q.contact_workPhone;
    c.contact.residence = q.contact_residence;
    c.contact.email = q.contact.email;
    c.contact.address = q.contact_address;
    c.contact.city = q.contact_city;
    c.contact.state = q.contact_state;
    c.contact.zip = q.contact_zip;
    c.contact.country = q.contact_country;
    c.remarks = q.remarks;
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


//WorkOrder
app.get('/api/op/create/workorder', function (req, res, next) {
    var Coll = require('./model/workOrder');
    var c = new Coll();
    var q = req.query;

    c.date = q.date;
    c.type = q.type;
    c.workOrderNo = q.workOrderNo;
    c.desc = q.desc;
    c.assignedTo = q.assignedTo;
    c.residence = q.residence;
    c.room = q.room;
    c.status = q.status;
    c.dueDate = q.dueDate;
    c.remarks = q.remarks;
    c.performedBy = q.performedBy;
    
    c.save(function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status: 1, message: data})
    });
});

app.get('/api/op/fetch/workorder', function(req, res, next){
  var Colle = require('./model/workOrder');
    Colle.find().exec( function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status:1, message : data});
    });
});


app.get('/api/op/delete/phone', function(req, res, next){
    var Collec = require('./model/workOrder');
    Collec.find({_id: req.query.id}).remove(function (err) {
        if (err)
            throw err
        respon = {status: 1};
        res.send(JSON.stringify(respon));
    })
});

app.get('/api/op/edit/phone', function(req, res, next){
    var Collec = require('./model/workOrder');
    var c = new Coll();
    var q = req.query;
        
    c.date = q.date;
    c.type = q.type;
    c.workOrderNo = q.workOrderNo;
    c.desc = q.desc;
    c.assignedTo = q.assignedTo;
    c.residence = q.residence;
    c.room = q.room;
    c.status = q.status;
    c.dueDate = q.dueDate;
    c.remarks = q.remarks;
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




/**************************************************************************
 * 
 * House Keeping
 **************************************************************************/

//Task
app.get('/api/op/create/housekeeptask', function (req, res, next) {
    var Coll = require('./model/houseKeepTask');
    var c = new Coll();
    var q = req.query;
    c.date = q.date;
    c.endDate = q.endDate;
    c.desc = q.desc;
    c.room = q.room;
    c.interval = q.interval;
    c.reminder = q.reminder;
    var maids = q.maids.split(',');
    console.log(maids);
    c.maids = maids;
    c.performedBy = q.performedBy;
    
    c.save(function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status: 1, message: data})
    });
});

app.get('/api/op/fetch/housekeeptask', function(req, res, next){
  var Colle = require('./model/houseKeepTask');
  var q = req.query;
  var crit = {};
  if(q.id!==undefined){
      console.log("THE ID "+q.id);
      crit = {maids:q.id};
  }
  
    Colle.find(crit).populate('room','name alias').exec( function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status:1, message : data});
    });
});

app.get('/api/op/delete/housekeeptask', function(req, res, next){
    var Collec = require('./model/houseKeepTask');
    Collec.find({_id: req.query.id}).remove(function (err) {
        if (err)
            throw err
        respon = {status: 1};
        res.send(JSON.stringify(respon));
    })
});

app.get('/api/op/edit/housekeeptask', function(req, res, next){
    var Collec = require('./model/houseKeepTask');
    var c = new Coll();
    var q = req.query;
        
    c.date = q.date;
    c.endDate = q.endDate;
    c.desc = q.desc;
    c.room = q.room;
    c.interval = q.interval;
    c.reminder = q.reminder;
    var maids = q.maids.split(',');
    c.maids = maids;
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



/**************************************************************************
 * 
 * Restaurant
 **************************************************************************/

//food
app.get('/api/op/create/food', function (req, res, next) {
    var Coll = require('./model/meal');
    var c = new Coll();
    var q = req.query;
    c.name = q.name;
    c.desc = q.desc;
    c.img = q.img;
    c.price=q.price;
    if(q.video!==undefined)c.video=q.video;
    if(q.article!==undefined)c.article=q.article;
    c.performedBy = q.performedBy;
    
    c.save(function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status: 1, message: data})
    });
});

app.get('/api/op/fetch/food', function(req, res, next){
  var Colle = require('./model/meal');
  var q = req.query;
  
    Colle.find().exec( function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status:1, message : data});
    });
});

app.get('/api/op/delete/food', function(req, res, next){
    var Collec = require('./model/meal');
    Collec.find({_id: req.query.id}).remove(function (err) {
        if (err)
            throw err
        respon = {status: 1};
        res.send(JSON.stringify(respon));
    })
});

app.get('/api/op/edit/food', function(req, res, next){
    var Collec = require('./model/meal');
    var c = new Coll();
    var q = req.query;
        
    c.name = q.name;
    c.desc = q.desc;
    c.img = q.img;
    c.price=q.price;
    if(q.video!==undefined)c.video=q.video;
    if(q.article!==undefined)c.article=q.article;
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

//Orders
//app.get('/api/op/create/orders', function (req, res, next) {
//    var Coll = require('./model/order');
//    var c = new Coll();
//    var q = req.query;
//    
//    console.log("THE ARRAY : "+q.food);
//    
//    c.orders = JSON.parse(q.orders);
//            //[{"text":"The text","food":"57fcf4381c7114122e59e894"},{"text":"The text","food":"57fcf4381c7114122e59e894"},{"text":"The text","food":"57fcf4381c7114122e59e894"}];
////    q.array;
//
//    c.save(function (err, data) {
//        if (err) {
//            return next(err);
//        }
//        return res.json({status: 1, message: data})
//    });
//});

//Entity
app.get('/api/op/create/orders', function (req, res, next) {
    var Coll = require('./model/entitySchema');
    var c = new Coll();
    //c.testvalue="I am";
    c.save(function (err, data) {
        if (err) {
            return next(err);
        }
        return res.json({status: 1, message: data})
    });
});



/****************************************************************************
 *
 *    Uploading and downloading image to the server
 ***************************************************************************/
//app.route('/api/op/static/upload')
app.route('/api/op/static/upload')
    .post(upload.postImage);


//SErve images
app.get('/api/op/static/image', function (req, res) {
    var respon = {status: 0};
    console.log(req.query);
    var image = req.query.id;
    console.log(imgDir+image);
    res.sendFile(imgDir+image,{maxAge:'5000'},function(){
        
    });
});

app.get('/api/static/image', function (req, res) {
    var respon = {status: 0};
    console.log(req.query);
    var image = req.query.id;
    console.log(imgDir+image);
    res.sendFile(imgDir+image,{maxAge:'5000'},function(){
        
    });
});



/****************************************************************************
 *
 *    SERVER ERROR HANDLING...
 ***************************************************************************/
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