var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var deptSchema = new Schema({
    on: Date,
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

var blogBost = mongoose.model('LostFound', deptSchema);
module.exports = blogBost;