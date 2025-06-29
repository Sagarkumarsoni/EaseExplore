const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");//we access the model and create a document
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

//Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", isLoggedIn, (req, res) => {
    console.log(req.user);
        res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            }
        })
        .populate("owner");
    if(! listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    } else {
        res.render("listings/show.ejs", {listing});
    }
    console.log(listing);
}));

//Create Route
router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res) => {
    // let { title, description, image, price, location, country } = req.body;
    // let newListing = new Listing({title, description, image, price, location, country});
    // await newListing.save();
    //     ***OR***
    
    const listing = req.body.listing; //request.body se listing object ko nikal rhe hai
    const newListing = new Listing(listing);
    console.log(req.user);
    newListing.owner = req.user._id;    
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings")
}));

//Edit Route -> it will serve a form
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
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
router.put("/:id", isLoggedIn, isOwner, validateListing, async (req, res) => {
    let { id } = req.params;
     
    await Listing.findByIdAndUpdate(id, {...req.body.listing});//req.body.listing is a js object which has different parameters and we deconstruct and convert into individual values and pass it to the new updated value
    req.flash("success", "Review Updated!");
    res.redirect(`/listings/${id}`);
   
});

//Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListings = await Listing.findByIdAndDelete(id);
    console.log(deletedListings);
    req.flash("success", "Listing Deleted!")
    res.redirect("/listings");
}));

module.exports = router;