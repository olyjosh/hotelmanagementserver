var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', 
  { 
      title: 'Travelwyd - Hotels, Flight &amp;Car' , 
      meta: {
          viewport:"width=device-width, initial-scale=1",
          keyword:"Hotels, Flights, Hotel, car rentals , booking , hotel booking, summer tour, trips, nigeria, travel, travelwyd ",
          description:"Travelwyd - Book Hotels, Flight &amp;Car",
          author:"Joshua Aroke (Olyjosh)"
        },
        page : 'hotel'
    });
});

module.exports = router;
