const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup", (req, res) => {
    res.render("./listings/signup.ejs");
});

router.post("/signup", wrapAsync(async(req, res) => {
    try {
        let {username, email, password} = req.body;
        const newUser = new User({username, email});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if(err) {
                return next(err); 
            }
            req.flash("success", "Welcome to wanderlust");
            res.redirect("/listings");
        })
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

router.get("/login", (req, res) => {
    res.render("./listings/login.ejs");
});

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    });
});

router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login", 
        failureFlash: true,
    }),
    (req, res) => {
        req.flash("success", "Welcome back to Wanderlust!");
        let redirectUrl = res.locals.redirectUrl || "/listings"; //if res.locals.redirectUrl not exists then "/listings" is called
        res.redirect(redirectUrl);
    }
);

module.exports = router;