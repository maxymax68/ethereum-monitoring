var mongoose = require('mongoose');
var txSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    number: Number,
    owner: String,
    description: String,
    company: String,
    wallet: String,
    ether: String,
    counterpart: String,
    timestamp: Date,
    value: Number,
    confirmations: Number,
    hash: String,
    loaded: Boolean,
});
 
var Tx = mongoose.model('Tx', txSchema);
 
module.exports = Tx;
