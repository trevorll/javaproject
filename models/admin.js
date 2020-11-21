const mongoose = require("mongoose");
      passportLocalMongoose = require("passport-local-mongoose");


const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  username: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  adminFrom: {
    type: Date,
    default: Date.now(),
  }
});
adminSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Admin", adminSchema);
