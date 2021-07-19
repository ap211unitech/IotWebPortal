const mongoose = require("mongoose");
const Schema = new mongoose.Schema;

const selectUser = new Schema({
    email: {
        type: String,
        required: true
    }, type: {
        type: String,
        required: true,
        default: 'user'
    },
    date: {
        type: Date,
        default: Date.now
    }
})


const SelectUserModel = mongoose.model('selectUser', selectUser);

module.export = SelectUserModel;