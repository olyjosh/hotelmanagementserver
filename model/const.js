var a = {};

a.RM_VACANT = "vacant";
a.RM_BOOKED = "Booking";
a.RM_OCCUPIED = "Occupied";
a.RM_RESERVED = "Reservation"
a.RM_DUEOUT = "due";
a.RM_DIRTY = "dirty";
a.RM_DISORDER = "disOrd";
a.RM_GOOD = "ok";

a.channel_ONLINE = "online";
a.channel_Mobile = "mobile";
a.channel_FRONT = "front";  // SAME AS CASH FOR PAYMENT
a.channel_POS = "pos"; //ONLY APPLICABLE FOR PAYMENT


a.trans_TYPE_HOTEL = "hotel";
a.trans_TYPE_LANNDRY = "laundry";
a.trans_TYPE_BAR = "bar";
a.trans_TYPE_BANQUET = "banquest";
a.trans_TYPE_OTHERS = "other";

a.lan_SERVICE_HOTEL = "hotel";
a.lan_SERVICE_LAUNDRY = "laundry";

a.ORDER_PENDING = 0;
a.ORDER_CANCEL = 1; 
a.ORDER_PREPARING = 2;
a.ORDER_DONE = 3;

a.USER_SUPER_ADMIN = 0;
a.USER_ADMIN = 1;
a.USER_ADMIN_2= 2;
a.USER_FRONT = 3;
a.USER_HOUSEKEEP = 4;
a.USER_LAUNDRY = 5;
a.USER_KITCHEN = 6;
a.USER_MINIBAR = 7;
a.USER_MAINTENANCE = 8;
a.USER_MAID = 9;
a.USER_BARTENDER = 10;


module.exports = a;

