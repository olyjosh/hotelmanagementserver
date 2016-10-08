var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sch = new Schema({
    onDate: Date,
    name: String,
    color: String,
    location: String,
    roomNo: String,
    current: String,
    founder: String,
    comp :{
        name: String,
        address: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        phone : String
    },
    reso:{
        returnBy : String,
        discardBy : String,
        returnDate : Date,
        discardDate : Date
    },
    remark : String,
    performedBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

var mod = mongoose.model('LostFound', sch);
module.exports = mod;