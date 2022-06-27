require('dotenv').config();
// console.log("dot env running");

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
// require mongoose
const mongoose = require("mongoose");

const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//setup the session here 
app.use(session({
    secret: "This is the session secret.",
    resave: false,
    saveUninitialized: true,
    cookie: {}
  })
);
//initialise passport and set up passport for session
app.use(passport.initialize());
app.use(passport.session());
//connect to local mongoose server
mongoose.connect("mongodb://localhost:27017/UserDB");

//create schema 
const userSchema = new mongoose.Schema({
    email : String, 
    password : String
});
userSchema.plugin(passportLocalMongoose);

// create model with the schema
const User = mongoose.model("User", userSchema);

// USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
    res.render("home");
});
app.get("/login", function(req, res){
    res.render("login");
});
app.get("/register", function(req, res){
    res.render("register");
});
app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        console.log("authenticated");
        res.render("secrets");
    }else{
        console.log("not");
        res.redirect("/login");
    }
});
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
})

app.post("/login", function(req, res){
    const user = new User ({
        username : req.body.username, 
        password : req.body.password
    });
    req.login(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    })
  });
app.post("/register", function(req, res){
    
    User.register({username : req.body.username}, req.body.password, function(err, result) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
        // Value 'result' is set to false. The user could not be authenticated since the user is not active
      });
    
});
app.listen("3000", function(req, res){
    console.log("Server started on port 3000 and running...");
})