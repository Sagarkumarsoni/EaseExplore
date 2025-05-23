const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js"); //we access the model and create a document
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

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

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


//Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
})

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", {listing});
}));

//Create Route
app.post("/listings", validateListing, wrapAsync(async (req, res) => {
    // let { title, description, image, price, location, country } = req.body;
    // let newListing = new Listing({title, description, image, price, location, country});
    // await newListing.save();
    //     ***OR***
        
        const listing = req.body.listing; //request.body se listing object ko nikal rhe hai
        const newListing = new Listing(listing);
        // console.log(newListing);

        await newListing.save();
        res.redirect("/listings")
}));

//Edit Route -> it will serve a form
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing })
}));

//Update Route
app.put("/listings/:id", validateListing, async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});//req.body.listing is a js object which has different parameters and we deconstruct and convert into individual values and pass it to the new updated value
    res.redirect(`/listings/${id}`);
});

//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListings = await Listing.findByIdAndDelete(id);
    console.log(deletedListings);
    res.redirect("/listings");
}));
//Reviews
//Post Reviwe Route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req, res) => {
    let listing = await Listing.findById(req.params.id);//A Mongoose method that retrieves a document from the Listing collection by its _id.
    let newReview = new Review(req.body.review);//This creates a new Review instance using the data from the request body.

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);

}));

//Delete Review Route
app.post("/listings/:id/reviews/:reviewId", wrapAsync(async(req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`)
}));

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