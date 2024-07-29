const mongoose = require("mongoose");

var schema = mongoose.Schema({
  username: String,
  password: {
    type: String,
    required: true,
    suppressReservedKeysWarning: true,
  },
  money: Number,
  ip: String,
  creationTime: String,
  hasMessages: Boolean,
});

module.exports = mongoose.model("users", schema);
