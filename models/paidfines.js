const mongoose = require("mongoose");

const fineSchema = new mongoose.Schema({
   book_info : {
       id : {
           type : mongoose.Schema.Types.ObjectId,
           ref : 'Book',
       },
       title : String,
       author : String,
       ISBN : String,
       issuedDate: {type:Date},
       fineDate : {type : Date, Default:Date.now()},
       returnDate : {type : Date},
       isPaid : {type: Boolean, default:false},
       isReturnedDate: {type: Date},
       amount: {type: Number},
       balance: {type: Number, default:0},
   },

   user_id : {
       id : {
           type : mongoose.Schema.Types.ObjectId,
           ref : 'User',
       },

       username : String,
   },
   fined_by: {
     id : {
       type: mongoose.Schema.Types.ObjectId,
       ref: User,
     },
     username: String,
   },
  return: {type:Boolean, default:false},
});


module.exports = mongoose.model("fine", fineSchema);
