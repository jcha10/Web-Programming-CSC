const express = require("express"); 
const crypt = require("crypto");
const session = require("express-session"); // Manage session state
const cookieParser = require("cookie-parser"); // Parse session cookie
const mysql = require("mysql2");

const app = express(); 

// Parse incoming form data and cookies
app.use(express.urlencoded({ extended: true })); 
app.use(express.static("public")); 
app.use(cookieParser());

// Initialize the session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secure-secret-key', // Signs the session ID cookie
  resave: false,                    // Prevents resaving unchanged sessions
  saveUninitialized: false,         // Prevents storing empty, uninitialized sessions
  cookie: { 
    maxAge: 60000 * 60,             // Cookie expiry set to 1 hour
    httpOnly: true,                
    secure: false                   
  }
}));

// Database connection setup
const pass = process.env.ROOTPASS || 'password'; 
const conn = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "Astroturf123!",
    port: 3306
});

conn.connect(function(err) {
	if(err) console.log("Couldnt connect to MySQL", err);
	else console.log("Database connection established");
}); 

const hashRounds = 100;
const hashLength = 64;
const salt = "salt";

// --- REGISTER ENDPOINT ---
app.post("/register", function(req, res) {
	let plainPass = req.body.password; 
	let username = req.body.userName;
	let fname = req.body.fname;
	let lname = req.body.lname;
	let gpa = Number(req.body.gpa);
    
    // Hash the password before saving it to the database
	let hashedPass = crypt.pbkdf2Sync(plainPass, salt, hashRounds, hashLength, 'sha512').toString(`hex`);
	
    // Insert the new student into the database
    let sql = "insert into student (fname,lname,gpa,user_id,password,salt) values (?,?,?,?,?,?)";
	conn.query(sql, [fname, lname, gpa, username, hashedPass, salt], function(err, result) {
		if (err) {
			console.log("There was an error inserting a student", err);
            res.send("Error registering user. Please try again.");
		} else {
			res.send(`<p>You have successfully registered ${fname} ${lname}. <a href="login.html">Login here</a></p>`);
        }
	});
});

// --- LOGIN ENDPOINT ---
app.post("/login", function(req, res) {
	let plainPass = req.body.password; 
	let username = req.body.username;
	
    // Hash the entered password to compare with the database
	const pass = crypt.pbkdf2Sync(plainPass, salt, hashRounds, hashLength, 'sha512').toString(`hex`);
	let sql = 'select * from student where user_id=? and password = ?'; 
	
    conn.query(sql, [username, pass], function(err, result) {
		if(err) {
			res.send(err);
		} else {
			if (result.length === 0) {
				res.send('<p>Your password or username are incorrect<br> <a href="login.html">Login </a> here </p>');	
			} else {
                // Store the user's information directly into the session variable
				req.session.user = { user_id: username, gpa: result[0].gpa };
				res.send(`<p>You have logged in successfully ${username}.<br> Visit your <a href="/profile">Profile</a></p>`); 
			}
		} 
	});
});

// --- PROFILE ENDPOINT ---
app.get("/profile", function(req, res) {
    // Check if the session variable exists
	if (!req.session.user) {
		res.send('You are not logged in. Please <a href="login.html">Login here</a>.');
    } else {
        // If logged in, greet them using the username stored in the session
		res.send(`Hi ${req.session.user.user_id}. Your gpa is ${req.session.user.gpa}. <br><a href="/logout">Logout</a><p>`);
	}
});

// --- LOGOUT ENDPOINT ---
app.get("/logout", function(req, res) {
    // Destroy the session, wiping the user's variables from memory
	req.session.destroy((err) => {
		if (err) {
            res.send("Error logging out"); //
        } else {
            // Provide a link back to the login page once the session is wiped
            res.send('Logged out successfully! <a href="login.html">Login Here</a>');
        }
	});
});

app.listen(3000, () => console.log("Server running on port 3000"));
