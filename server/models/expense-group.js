const mongoose = require('mongoose');
const user = require('./user');

const Schema = mongoose.Schema;
const expenseGroupSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    participants: {
        type: [String],
        required: true
    }
})

module.exports = mongoose.model('expenseGroup', expenseGroupSchema);