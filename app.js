require('dotenv').config();
// console.log("dot env running");

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
// require mongoose
const mongoose = require("mongoose");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//connect to local mongoose server
mongoose.connect("mongodb://localhost:27017/UserDB");

//create schema 
const userSchema = new mongoose.Schema({
    email : String, 
    password : String
});

// create model with the schema
const User = mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});
app.get("/login", function(req, res){
    res.render("login");
});
app.get("/register", function(req, res){
    res.render("register");
});
// app.get("/secrets", function(req, res){
//     res.render("secrets");
// });

app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    

    //here we use the model name
    User.findOne({email : username}, function(err, foundUser){
        if(err){
            console.log(err);
        }else {
            bcrypt.compare(password, foundUser.password, function(err, result) {
                if(result == true){
                    res.render("secrets");
                }
            });
        }
    })
});
app.post("/register", function(req, res){
    //create entry in db with the data you are getting
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const user = new User({
            email : req.body.username,
            password : hash
        });
        user.save(function(err){
            if(err){
                console.log(err);
            }else{
                res.render("secrets");
            }
        });
    });
});
app.listen("3000", function(req, res){
    console.log("Server started on port 3000 and running...");
})