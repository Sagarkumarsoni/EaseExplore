const mongoose = require("mongoose");
const Schema = mongoose.Schema; //create a Schema so as we do not write again&again mongoose.Schema
const Review = require("./review.js");

const listingSchema = new Schema({
    title: { 
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    // image: {         
    //     type: String,
    //     default: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    //     set: (v) => 
    //         v === ""
    //      ? "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    //       : v,
    // },
    image: {
        url: String,
        filename: String,
    },
    price: {
        type: Number,
    },
    location: {
        type: String,
    },
    country: {
        type: String,
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,//all the objectId from the review is stored inside this array
            ref: "Review"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    category: {
        type: String,
        enum: ["mountains", "cities", "arctic", "farm", "deserts"],
    }
});

listingSchema.post("findOneAndDelete", async(listing) => {
    if(listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews }});
    }
});

const Listing =  mongoose.model("Listing", listingSchema);//a model is created called Listing
module.exports = Listing; //Listing model is exported to app.js