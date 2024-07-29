const mongoose = require("mongoose");

var schema = mongoose.Schema({
  from: String,
  to: String,
  content: String,
  sendAt: Date,
  read: { type: Boolean, default: false },
});

module.exports = mongoose.model("convs", schema);
