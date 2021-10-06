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
});

module.exports = mongoose.model("livedata", LiveDataSchema);
