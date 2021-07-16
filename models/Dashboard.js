const mongoose = require('mongoose');

const DashboardSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    image: [
        {
            name: {
                type: String,
                required: true
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

const Dasboard = mongoose.model('dashboard', DashboardSchema);

module.exports = Dasboard;