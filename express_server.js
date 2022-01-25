const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

// Set up EJS as the Express view engine
app.set("view engine", "ejs");

// Convert buffer data into string
app.use(bodyParser.urlencoded({ extended: true }));

// Database info
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Root or homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Displays all URLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Render form for new shortURL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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

// Delete posts
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

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

// Returns a random string of alphanumeric characters:
function generateRandomString() {
  let str = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomStr = "";
  for (i = 0; i < 6; i++) {
    let randomNum = Math.floor(Math.random() * str.length);
    randomStr += str[randomNum];
  }
  return randomStr;
}
