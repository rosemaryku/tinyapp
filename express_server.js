const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Set up EJS as the Express view engine
app.set("view engine", "ejs");

// Convert buffer data into string
app.use(bodyParser.urlencoded({ extended: true }));

// DATABASES //

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
};

// ROUTES //

// Root or homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

// All URLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

// New URL
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

// Submit new URL and redirect to urls/:shortURL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// View specific URL details
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
  };
  if (templateVars.longURL === undefined) {
    res.status(404);
    return res.render("urls_error");
  }
  res.render("urls_show", templateVars);
});

// Redirect Short URLs
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    res.status(404);
    return res.render("urls_error");
  }
  res.redirect(longURL);
});

// Delete post
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// Edit post
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect("/urls");
});

// Login
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// Register
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  users.userRandomID = {
    id: userRandomId,
    email: req.body.email,
    password: req.body.password,
  };
  console.log(users);
});

// MISC //

// View JSON details from database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Test code to view HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Activate server to listen for requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// HELPER FUNCTIONS //
function generateRandomString() {
  let str = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomStr = "";
  for (i = 0; i < 6; i++) {
    let randomNum = Math.floor(Math.random() * str.length);
    randomStr += str[randomNum];
  }
  return randomStr;
}
