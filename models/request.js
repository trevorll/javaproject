const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
   book_info : {
       id : {
           type : mongoose.Schema.Types.ObjectId,
           ref : 'Book',
       },
       title : String,
       author : String,
       ISBN : String,
       category : String,
       stock : Number,
       requestDate : {type : Date, default : Date.now()},
   },

   user_id : {
       id : {
           type : mongoose.Schema.Types.ObjectId,
           ref : 'User',
       },

       username : String,
   },
   reason: String,
});


module.exports = mongoose.model("Request", requestSchema);
