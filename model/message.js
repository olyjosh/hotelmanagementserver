var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    from : String,
    to : String,
    message : String
},{timestamps: true});

var mod = mongoose.model('Message', MessageSchema);
module.exports = mod;