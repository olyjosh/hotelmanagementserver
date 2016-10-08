var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var drinkSchema = new Schema({
    name : String,
    alcohol : Number,
    img : String,
    article : { link: String, type : String /* can be website or just text*/ }
},{timestamps: true});

var mod = mongoose.model('Drink', drinkSchema);
module.exports = mod;