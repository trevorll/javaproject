const express = require("express");
      // mpesa = require("mpesa-node");
      // mpesasdk = require("mpesa-node-sdk");
      pdf =require('express-pdf')
      mime = require('mime-type');
      dotenv = require("dotenv");
      app = express();
      bodyParser = require("body-parser");
      mongoose = require("mongoose");
      passport = require("passport");
      multer = require('multer');
      uid = require('uid');
      path = require("path");
      sanitizer = require("express-sanitizer");
      methodOverride = require("method-override");
      localStrategy = require("passport-local");
      fs = require("fs");
      flash = require("connect-flash");

      User = require("./models/user");
      Admin = require("./models/admin");
      Issue = require("./models/issue");
      Epdf = require("./models/epdf");
      Request = require("./models/request");
      Paidfine = require("./models/paidfines");
      userRoutes = require("./routes/users");
      authRoutes = require("./routes/auth");
      bookRoutes = require("./routes/books");
      adminRoutes = require("./routes/admin");
      otherRoutes = require("./routes/other");
      middleware = require("./middleware");


//seed(1000);

//app config
dotenv.config();
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended : true}));
app.use(sanitizer());
console.log(process.env.name);


//db config
const url = process.env.db_url || "mongodb://localhost/db1";
mongoose.connect(url, {useNewUrlParser : true, useCreateIndex: true, useUnifiedTopology: true,});

mongoose.set('useFindAndModify', false);
app.use(pdf);
// console.log(pdf.PDF);


//passport config
app.use(require("express-session")({
  secret : "goddy godd gody",
  saveUninitialized : false,
  resave : false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




//config image file storage
// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'books'); 
//   },
//   filename: (req, file, cb) => {
    
//     cb(null, `${file.originalname}`);   
//   }
// });
// const filefilter = (req, file, cb) => {
//   if(file) {
//   if(
//       path.extname(req.file.originalname)  === 'image/jpg' ||
//       path.extname(req.file.originalname)  === 'image/png' ||
//       path.extname(req.file.originalname)  === 'image/jpeg'||
//       path.extname(req.file.originalname)  === 'application/pdf'

//     ) { cb(null, true);
//     } else {
//       cb(null, false);
//     }
//   }
  
// };

// app.use(multer({storage: fileStorage, filefilter: filefilter()}).single('book'));
  
// app.use('/books', express.static(path.join(__dirname, 'book')));


const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if(file.fieldname === "image"){
      cb(null, 'images');
  }else if(file.fieldname === "book"){
    cb(null, 'books')
  }
 } ,
  filename: (req, file, cb) => {
    if(file.fieldname === "image"){
    cb(null, `${uid.uid()}-${file.originalname}`);
  }else if(file.fieldname ==="book"){
    cb(null, `${file.originalname}`)
  }
}
});
const filefilter = (req, file, cb) => {
  if(file){
      if(req.file.fieldname ==="image"){
        if(
          path.extname(req.file.originalname)  === 'image/jpg' ||
          path.extname(req.file.originalname)  === 'image/png' ||
          path.extname(req.file.originalname)  === 'image/jpeg'
          ) { cb(null, true);
          } else {
          cb(null, false);
          }
        }else if(req.file.fieldname === "book"){
          if(
            path.extname(req.file.originalname)  === 'application/pdf'
          ) { cb(null, true); 
          } else {
                  cb(null, false);
                }
        }
    }
  
}
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/books', express.static(path.join(__dirname, 'books')));
app.use(multer({storage: fileStorage, filefilter: filefilter()}).fields([{name:'image',maxCount:1},{name:'book',maxCount:1}]));





app.use((req, res, next) => {
  res.locals.currentUser =req.user;
  res.locals.error       =req.flash("error");
  res.locals.success     =req.flash("success");
  res.locals.warning     =req.flash("warning");
  next();
});

//routes
app.use(userRoutes);
app.use(authRoutes);
app.use(bookRoutes);
app.use(adminRoutes);
app.use(otherRoutes);

function deleteImage(imagePath, next) {
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.log("Failed to delete image at delete profile");
      return next(err);
    }
  });
}
app.listen(8000, ()=> {
  console.log(`application running at: http://localhost:8000`);
});
