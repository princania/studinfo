const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser")

mongoose.connect("mongodb://localhost:27017/studinfo");

let today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
let yy = String(today.getFullYear()).slice(-2);
let date = dd + '/' + mm + '/' + yy;
const incomeschema = mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    catagory: String,
    history: [
        {
            amount: Number,
            catagory: String,
            date: String
        }
    ]
})
const expenseschema = mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    catagory: String
})
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    reg: {
        type: Number,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    income: incomeschema,
    expense: expenseschema
})


const user = new mongoose.model("Users", userSchema);

var loginstatus = false;
var registration = 1234;

app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }))
//Money Page
app.post("/addincome", function (req, res) {

    //get the value of amount, for the sum

    user.updateOne(
        { "reg": registration },
        {
            //   $setOnInsert:{
            //     "income.amount": 0
            //   },
            $inc: {
                "income.amount": req.body.amount
            },
            $set: {
                "income.catagory": req.body.catagory
            },
            $push: {
                "income.history": {
                    "amount": req.body.amount,
                    "catagory": req.body.catagory,
                    "date": date
                }
            }
        }

    )
        .then(result => {
            res.render("money");
        })
        .catch(err => {
            console.log(err);
        });
});






app.listen(3000, () => {
    console.log("Server started on port 3000");
});

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/money", function (req, res) {
    if (loginstatus == true) {
        user.findOne({ reg: registration })
            .then((founduser) => {
                var incomeamountt = founduser.income.amount;
                
                console.log(incomeamountt);
                res.render("money", { income: incomeamountt });
            })
            .catch((err) => {
                console.log(err);
                res.render("money", { income: '0' });
            });
    }
    else {
        res.redirect("login")
    }
});


app.get("/time", function (req, res) {
    if (loginstatus == true) {
        res.render("time");
    }
    else {
        res.redirect("login")
    }

});

app.get("/resources", function (req, res) {
    if (loginstatus == true) {
        res.render("resources");
    }
    else {
        res.redirect("login")
    }

});

// login and signup
app.post("/signup", function (req, res) {
    var newUser = new user({
        name: req.body.name,
        reg: req.body.reg,
        email: req.body.email,
        password: req.body.pass
    });

    newUser.save()
        .then(doc => {
            res.redirect("/login");
        })
        .catch(err => {
            res.render("login", { error: 'Invalid Input, user already exists.' });
        });

})

app.get("/login", function (req, res) {
    res.render("login", { error: 'Enter login credentials' });
});

app.post('/login', (req, res) => {
    const { regno, pass } = req.body;
    registration = regno;
    user.findOne({ reg: regno })
        .then((founduser) => {
            if (founduser && founduser.password === pass) {
                loginstatus = true;
                res.redirect('/money');
            } else {
                res.render('login', { error: 'Invalid login credentials.' });
            }
        })
        .catch((err) => {
            console.log(err);
            res.render('login', { error: 'An error occurred. Please try again.' });
        });
});

app.get("/signup", function (req, res) {
    res.render("signup");
})