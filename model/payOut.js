var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sch = new Schema({
    voucherNo: String,
    paidTo: String,
    category: String,
    extraCharge: String,
    roomNO: String,
    amount: String,
    discount: String,
    tax: Number,
    qty : Number,
    adjustment: Number,
    amountPaid: Number,
    total : Number,
    remarks: String,
    performedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, {timestamps: true});

var mod = mongoose.model('PayOut', sch);
module.exports = mod;