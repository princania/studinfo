const express = require("express");
const app = express();
const ejs = require("ejs");

app.set("view engine", "ejs");
app.use(express.static('public'));

app.listen(3000, () => {
    console.log("Server started on port 3000");
});

app.get("/", function(req,res){
    res.render("home");
});

app.get("/login", function(req,res){
    res.render("login");
});

app.get("/signup", function(req,res){
    res.render("signup");
})