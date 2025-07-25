if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

let MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"; //this is a localhost url

main()  //function that confirms the connection has been established or  not
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() { //async function that connects MongoDB database using Mongoose
    await mongoose.connect(MONGO_URL);
}

app.set("views", path.join(__dirname, "views"));//
app.set("view engine", "ejs");//
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));//to use static files like css

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true, 
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next(); //when we call next the next route is get matched i.e., app.use("/listings", listings)
});

app.get("/registerUser", async(req, res) => {
    let fakeUser = new User({
        email: "student@gmail.com",
        username: "delta-student",
    });
    let newUser = await User.register(fakeUser, "helloworld");
    res.send(newUser);
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


// app.get("/testListing", async (req, res) => { //since we have to parse data to the database so this is asynchronous function
//     let sampleListing = new Listing({
//         title: "My new villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India"
//     });

//     await sampleListing.save(); 
//     console.log("sample was saved");
//     res.send("successful testing");
// });

app.all(/.*/, (req, res, next)  => { // like localhost:8080/random
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode=500, message="Something went wrong" } = err;// err se hm statusCode and message nikalenge  
    res.status(statusCode).render("listings/error.ejs", { message });
    // res.status(statusCode).send(message);   
    // res.send("Something went Wrong");//used for wrapAsync
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});
