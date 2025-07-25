const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");//we access the model and create a document
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js")
const multer  = require('multer'); //to parse form data use multer
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage }); //multer extracts files from from data and makes a file uploads and save the file at uploads

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        validateListing, 
        upload.single("listing[image]"),
        wrapAsync(listingController.createListing)
    );
// .post(upload.single("listing[image]"), (req, res) => {
//     res.send(req.file);
// });

//Index Route
// router.get("/", wrapAsync(listingController.index));

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);
//update Route
router.route("/:id")
    .get(
        wrapAsync(listingController.showListing)
    )
    .put(
        isLoggedIn, 
        isOwner, 
        upload.single("listing[image]"),
        validateListing, 
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn, 
        isOwner, 
        wrapAsync(listingController.destroyListing)
    )

//Show Route
// router.get("/:id", wrapAsync(listingController.showListing));

//Create Route
// router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));

//Edit Route -> it will serve a form
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

//Update Route
// router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

//Delete Route
// router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;