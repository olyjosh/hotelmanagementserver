var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', 
  { 
      title: 'Hotel Management Webservices' , 
      meta: {
          viewport:"width=device-width, initial-scale=1",
          keyword:"",
          description:"",
          author:"Joshua Aroke (Olyjosh)"
        }
    });
});

module.exports = router;
