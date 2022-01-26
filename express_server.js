const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080;

app.use(cookieParser());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// DATABASES //

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {};

// ROUTES //

// Root or homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

// All URLs
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

// New URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
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
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_show", templateVars);
});

// Redirect Short URLs
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];

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

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// Register
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    user: users[req.cookies["user_id"]],
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    console.log("Error missing field");
    return res.status(400);
  }
  if (isUser(users, email)) {
    console.log("User already exists");
    return res.status(400);
  }

  const id = generateRandomString();
  const newUser = {
    id,
    email,
    password,
  };

  users[id] = newUser;
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUser(users, email, password);
  if (user) {
    res.cookie("user_id", user);
    res.redirect("urls");
  } else res.status(403).redirect("/login");
});

//
// MISC //

// View JSON details from database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Test code to view HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// HELPER FUNCTIONS //
const generateRandomString = () => {
  let str = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomStr = "";
  for (i = 0; i < 6; i++) {
    let randomNum = Math.floor(Math.random() * str.length);
    randomStr += str[randomNum];
  }
  return randomStr;
};

const isUser = (users, email) => {
  for (let keyID in users) {
    if (users[keyID].email === email) return true;
  }
  return false;
};

const findUser = (users, email, password) => {
  for (let id in users) {
    if (users[id].email === email) {
      if (users[id].password === password) {
        return id;
      } else console.log("Invalid password");
    } else console.log("Invalid email");
  }
  return null;
};
