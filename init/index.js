// const express = require("express");
// const app = express();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";//this is a localhost url

main()//function that confirms the connection has been established or  not
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {//async function that connects MongoDB database using Mongoose
    await mongoose.connect(MONGO_URL);
}

const initDB = async() => {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);//in initData-> data gets accessed and inserted in Listing
    console.log("data was initialized");
};

initDB();