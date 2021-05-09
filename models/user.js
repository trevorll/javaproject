const mongoose = require("mongoose"),
      passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
  },
  lastName : {
    type: String,
    trim: true,
  },
  userName : {
    type: String,
    trim: true,
  },
  gender : {
    type: String,
    trim: true,
  },
  email : {
    type: String,
    trim: true,
  },
  password : String,
  image : String,
  isAdmin: {type: Boolean, default:false},
  violationFlag : {type:Boolean, default:false},
  fines : {type:Number, default: 0},
  bookIssueInfo : [{
    book_info : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Issue"
    }
  }],
  joined : {type: Date,default: Date.now()},
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",userSchema);
