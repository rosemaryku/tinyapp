const express = require("express");
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const salt = bcrypt.genSaltSync(10);
const { getUserByEmail } = require("./helpers.js");

const app = express();
const PORT = 8080;

// app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

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
  h7fg6g: {
    id: "userRandomID",
    email: "123@example.com",
    password: "123",
  },
  ok88lv: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// ROUTES //
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  return res.redirect("/login");
});

// Diplay url index table
app.get("/urls", (req, res) => {
  let userURLS = urlsForUser(urlDatabase, req.session.user_id);
  const templateVars = {
    user: users[req.session.user_id],
    urls: userURLS,
  };
  // If not logged in, redirect to prompt webpage, else return URL index
  if (!req.session.user_id) {
    return res.render("prompt", templateVars);
  }
  res.render("urls_index", templateVars);
});

// Diplay new shortURLs form. Redirected to login page if not logged in)
app.get("/urls/new", (req, res) => {
  // If user is not logged in
  if (!users[req.session.user_id]) return res.render("prompt", { user: null });

  // If user is logged in
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

// Submit new URL and redirect to urls/:shortURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  // console.log("new db: ", urlDatabase[shortURL]);
  // console.log("short url: ", shortURL);
  res.redirect(`/urls/${shortURL}`);
});

// View specific URL details /// FIX THIS
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };

  // Invalid short URL
  if (!urlDatabase[req.params.shortURL]) {
    return res
      .status(403)
      .render("error", { user: users[req.session.user_id] });
  }

  // User not logged in
  if (!req.session.user_id) {
    // console.log("Need to login");
    return res.status(403).render("prompt", { user: null });
  }

  // User logged in, but does not own URL
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res
      .status(403)
      .render("error", { user: users[req.session.user_id] });
  }

  // console.log("template user: ", templateVars);
  res.render("urls_show", templateVars);
  console.log("Database:", urlDatabase);
  // console.log("Users:", users);
});

// Use of short URL
app.get("/u/:shortURL", (req, res) => {
  // if URL does not exist
  if (!urlDatabase[req.params.shortURL]) {
    console.log("URL DOES NOT EXIST");
    res.status(403).send("Error webpage does not exist");
    return;
  }

  // if URL does exists redirect to full website
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect("https://" + longURL);
});

// Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    console.log("Unauthorized to delete");
    res.status(403).res.redirect("/prompt");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
  console.log(urlDatabase);
});

// Update URL
app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.status(403).render("error", { user: req.cookies.user_id });
  }
  urlDatabase[req.params.id].longURL = req.body.newURL;
  console.log(urlDatabase);
  res.redirect("/urls");
});

// Login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    error: null,
  };
  res.render("login", templateVars);
});

// Login submission
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = getUserByEmail(email, users);

  if (user && bcrypt.compareSync(password, users[user].password)) {
    req.session.user_id = user;
    res.redirect("urls");
  } else {
    res.status(403).send("Invalid username or password");
  }
});

// Logout
app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  res.redirect("/login");
});

// Register page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }

  const templateVars = {
    urls: urlDatabase,
    users: users,
    user: users[req.session.user_id],
  };
  res.render("register", templateVars);
});

// Submit registration
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Check if email or password are null
  if (!email || !password) {
    return res.status(400).send("Missing username or password");
  }

  // Check if email is already registered
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Username already exists");
  }

  const hashedPassword = bcrypt.hashSync(password, salt);
  //create new user
  const id = generateRandomString();
  const newUser = {
    id: id,
    email: email,
    password: hashedPassword,
  };

  req.session.user_id = id;
  users[id] = newUser;
  res.redirect("/urls");
  // console.log(users);
});

//
// MISC //

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

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
