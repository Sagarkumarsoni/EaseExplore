const express = require("express");
const app = express();
const users = require("./routes/user.js");
const posts = require("./routes/post.js");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
// const cookieParser = require("cookie-parser");

const sessionOptions = {secret: "mysupersecretstring", resave: false, saveUninitialized: true};

app.set("views", path.join(__dirname, "views"));//
app.set("view engine", "ejs");

app.use(session(sessionOptions));
app.use(flash());
app.use((req, res, next) => {
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    next();
})

app.get("/register", (req, res) => { //information is stored in the session
    let {name = "anonymous"} = req.query;
    req.session.name = name;
    if(name == "anonymous") {
        req.flash("error", "user not registered!");
    } else {
        req.flash("success", "user registered successfully!");
    }
    res.redirect("/hello");
});

app.get("/hello", (req, res) => { //information is accessed from the session
    res.render("page.ejs", {name: req.session.name});
});

// app.get("/reqcount", (req, res) => {
//     if(req.session.count) {
//         req.session.count++;
//     } else {
//         req.session.count = 1;
//     }
//     res.send(`You sent a request ${req.session.count} times`);
// });

app.listen(3000, () => {
    console.log("server is listening to port 3000");
});