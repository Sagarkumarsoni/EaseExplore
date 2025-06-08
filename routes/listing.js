const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");//we access the model and create a document

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

//Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
})

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(! listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    } else {
        res.render("listings/show.ejs", {listing});
    }
}));

//Create Route
router.post("/", validateListing, wrapAsync(async (req, res) => {
    // let { title, description, image, price, location, country } = req.body;
    // let newListing = new Listing({title, description, image, price, location, country});
    // await newListing.save();
    //     ***OR***
    
    const listing = req.body.listing; //request.body se listing object ko nikal rhe hai
    const newListing = new Listing(listing);
    // console.log(newListing);
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings")
}));

//Edit Route -> it will serve a form
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    } else {
        res.render("listings/edit.ejs", { listing })
    }
}));

//Update Route
router.put("/:id", validateListing, async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});//req.body.listing is a js object which has different parameters and we deconstruct and convert into individual values and pass it to the new updated value
    req.flash("success", "Review Updated!");
    res.redirect(`/listings/${id}`);
});

//Delete Route
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListings = await Listing.findByIdAndDelete(id);
    console.log(deletedListings);
    req.flash("success", "Listing Deleted!")
    res.redirect("/listings");
}));

module.exports = router;