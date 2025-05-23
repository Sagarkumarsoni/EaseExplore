const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

//Show-Index Route
app.get("/users", (req, res) => {
    res.send("GET for users");
});

//Show-Users Route
app.get("/users/:id", (req, res) => {
    res.send("GET for user id");
});

//POST - users
app.post("/users", (req, res) => {
    res.send("POST for users");
});

//DELETE - users
app.delete("/users/:id", (req, res) => {
    res.send("DELETE for user id");
});

//Posts
//Index
app.get("/posts", (req, res) => {
    res.send("GET for posts");
});

//Show
app.get("/posts/:id", (req, res) => {
    res.send("GET for post id");
});

//POST
app.post("/posts", (req, res) => {
    res.send("POST for posts");
});

//DELETE
app.delete("/posts/:id", (req, res) => {
    res.send("DELETE for post id");
});

app.listen(3000, () => {
    console.log("server is listening to port 3000");
});