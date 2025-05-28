const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

app.set("views", path.join(__dirname, "views"));//
app.set("view engine", "ejs");//
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));//to use static files like css

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

app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);


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