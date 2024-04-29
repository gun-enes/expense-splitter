const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const expenseSchema = new Schema({
    expensegroup: {
        type: String,
        required: true,
    },
    payer: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true
    },
    cost: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
})

module.exports = mongoose.model('expense', expenseSchema);