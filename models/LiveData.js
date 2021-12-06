const mongoose = require("mongoose");

const LiveDataSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
  },
  data: [
    {
      time: {
        type: String,
        required: true,
      },
      data: {
        type: String,
        required: true,
      },
    },
  ],
  lastEmailSent: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model("livedata", LiveDataSchema);
