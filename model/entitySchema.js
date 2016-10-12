var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
//autoIncrement.initialize(mongoose.connection);

var CounterSchema = Schema({
    docId : {type: Number, default: 1, required: true},
//    seq: { type: Number, default: 0 }
});

//CounterSchema.plugin(autoIncrement.plugin, 'Counter');// This change the usual
CounterSchema.plugin(autoIncrement.plugin, { model: 'Counter', field: 'docId' });
var mod = mongoose.model('Counter', CounterSchema);

module.exports = mod;