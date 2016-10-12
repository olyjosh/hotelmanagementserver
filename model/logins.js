var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./user');

var sch = new Schema({
  login: Boolean,  // loging or logout  which are true or false respectively
  user: {type : mongoose.Schema.Types.ObjectId , ref : 'User'},
},{timestamps: true});

var mod = mongoose.model('Login', sch);
module.exports = mod;
