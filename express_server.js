const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080;

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.set("view engine", "ejs");

// DATABASES //

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "123@example.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// ROUTES //

// Diplay url index table
app.get("/urls", (req, res) => {
  let userURLS = urlsForUser(urlDatabase, req.cookies.user_id);
  const templateVars = {
    user: users[req.cookies.user_id],
    urls: userURLS,
  };
  // If not logged in, redirect to prompt webpage, else return URL index
  if (!req.cookies.user_id) {
    return res.render("prompt", templateVars);
  }
  res.render("urls_index", templateVars);
});

// Diplay new shortURLs form. Redirected to login page if not logged in)
app.get("/urls/new", (req, res) => {
  if (!users[req.cookies["user_id"]]) return res.redirect("/login");

  const templateVars = {
    user: users[req.cookies["user_id"]],
  };

  res.render("urls_new", templateVars);
});

// Submit new URL and redirect to urls/:shortURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id,
  };
  // console.log("new db: ", urlDatabase[shortURL]);
  // console.log("short url: ", shortURL);
  res.redirect(`/urls/${shortURL}`);
});

// View specific URL details
app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params);
  if (!urlDatabase[req.params.shortURL]) return res.redirect("/login");

  if (urlDatabase[req.params.shortURL].userID !== req.cookies["user_id"]) {
    return res.status(403).redirect("/login");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };
  console.log("template user: ", templateVars);
  res.render("urls_show", templateVars);
  // console.log(req.params);
});

// Redirect Short URLs to the full website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect("https://" + longURL);
});

// Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const cookieUser = req.cookies.user_id;
  const shortURL = req.params.shortURL;
  if (cookieUser !== urlDatabase[shortURL].userID) {
    console.log("Permission to delete denied");
    res.redirect("/prompt");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

// Update url - might need to come back to this
app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].userID !== req.cookies["user_id"]) {
    return res.status(403).redirect("/login");
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

// Login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };

  res.render("login", templateVars);
});

// Login submission
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUser(users, email, password);
  if (user) {
    res.cookie("user_id", user);
    res.redirect("urls");
  } else res.status(403).redirect("/login");
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// Register page
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    user: users[req.cookies["user_id"]],
  };
  res.render("register", templateVars);
});

// Submit registration
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log("Password:", password);
  console.log("Hashed Password:", hashedPassword);
  console.log(bcrypt.compareSync("panda", hashedPassword));
  console.log(typeof hashedPassword);

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

//
// MISC //

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// Test code to view HTML
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// HELPER FUNCTIONS //

// Generate random alphanumeric string with 6 characters
const generateRandomString = () => {
  return (Math.random() + 1).toString(36).substring(6);
};

// Checks if user is already in database
const isUser = (users, email) => {
  for (let keyID in users) {
    if (users[keyID].email === email) return true;
  }
  return false;
};

// Checks login credentials
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

// Returns urls for specific user
const urlsForUser = (urlDatabase, userID) => {
  let urls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
};
