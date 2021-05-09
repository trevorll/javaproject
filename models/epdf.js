// Calling the "mongoose" package
const mongoose = require("mongoose");

// Creating a Schema for uploaded files
const epdfSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  name: String,
  ISBN : String,
  author : String,
  description : String,
  category : String,
});


// Exporting the Model to use it in app.js File.
module.exports = mongoose.model("Epdf", epdfSchema);