const express = require("express");
const app = express(); 

// Server read the data typed
app.use(express.urlencoded({ extended: true }));
// This tells the server where your HTML files are located
app.use(express.static("public")); 

// --- REGISTER ENDPOINT ---
app.post("/register", function(req, res) {
    // When someone successfully registers, the site responds and a link to login.html
    res.send(`
        <p>You have successfully registered</p>
        <a href="login.html">Go to Login Page</a>
    `);
});

// --- LOGIN ENDPOINT ---
app.post("/login", function(req, res) {
    let username = req.body.username;
    let plainPass = req.body.password; 
    
    //This prints what the registration sent to terminal
    console.log("The server received Username:", username);
    console.log("The server received Password:", plainPass);

    let isSuccessful = (username === "admin" && plainPass === "password123");

    if (isSuccessful) {
        res.send("<p>You have logged in successfully</p>");
    } else {
        res.send(`
            <p>the login credentials were incorrect</p>
            <a href="login.html">Go back to login.html</a>
        `);
    }
});

// Starts the server
app.listen(3000, function() {
    console.log("Server is running! Open http://localhost:3000/register.html in your browser.");
});
