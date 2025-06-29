const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware.js");

//Post Review Route
router.post("/", isLoggedIn, validateReview, wrapAsync(async(req, res) => {
    console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);//A Mongoose method that retrieves a document from the Listing collection by its _id.
    let newReview = new Review(req.body.review);//This creates a new Review instance using the data from the request body.
    newReview.author = req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);

}));

//Delete Review Route
router.post("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async(req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`)
}));

module.exports = router;