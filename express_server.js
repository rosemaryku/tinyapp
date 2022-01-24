const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

// Set up EJS as the Express vie engine
app.set("view engine", "ejs");

// Convert buffer data into string
app.use(bodyParser.urlencoded({ extended: true }));

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

// Render form for new TinyURL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Submit a form to URLs
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

// View selected shortURL details
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
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

// Returns a string of 6 random alphanumeric characters:
function generateRandomString() {
  let str = "abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomStr = "";
  for (i = 0; i < 6; i++) {
    let randomNum = Math.floor(Math.random() * str.length);
    randomStr += str[randomNum];
  }
  return randomStr;
}
