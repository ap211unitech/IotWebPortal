const mongoose = require("mongoose");

const SensorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    sensor: [
        {
            image: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            sensorDetail: [
                {
                    sensorId: {
                        type: String,
                        required: true
                    },
                    sensorName: {
                        type: String,
                        required: true
                    },
                    imageCoordinates:
                    {
                        hRatio: {
                            type: Number,
                            required: true
                        },
                        vRatio: {
                            type: Number,
                            required: true
                        }
                    },
                    category: {
                        type: String,
                        required: true
                    },
                    latitude: {
                        type: Number,
                        required: true
                    },
                    longitude: {
                        type: Number,
                        required: true
                    }
                }
            ]
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('sensor', SensorSchema);