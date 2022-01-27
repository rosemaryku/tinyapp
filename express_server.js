const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080;

app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

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
  id: "zf98fs",
  email: "rosemary.ku@example.com",
  password: "testpass",
};

// ROUTES //

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    return res.redirect("/login");
  }
  let userURLS = urlsForUser(urlDatabase, req.cookies["user_id"]);
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: userURLS,
  };
  res.render("urls_index", templateVars);
});

// New URL
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
  console.log("new db: ", urlDatabase[shortURL]);
  console.log("short url: ", shortURL);
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

// Redirect Short URLs to the full website // COME BACK
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  console.log("Database:", urlDatabase);
  console.log("params: ", req.params);
  console.log("Short URL:", shortURL);
  console.log("Database 1:", urlDatabase);
  console.log("Database 2:", urlDatabase[shortURL]);
  console.log("Database 3:", urlDatabase[shortURL]["longURL"]);

  const realSite = urlDatabase[req.params.shortURL]["longURL"];
  console.log(realSite);
  res.redirect(realSite);

  // console.log("long URL", urlDatabase[req.params.shortURL].longURL);
  // const longURLVar = urlDatabase[req.params.shortURL].longURL;
  // res.redirect(longURLVar);
});

// DELETE POST
app.post("/urls/:shortURL/delete", (req, res) => {
  // if (urlDatabase[req.params.shortURL].userID !== req.cookies["user_id"]) {
  //   return res.status(403).redirect("/login");
  // }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//// HERE //
app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].userID !== req.cookies["user_id"]) {
    return res.status(403).redirect("/login");
  }

  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

// LOGIN
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

// LOGOUT POST
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// REGISTER
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

//
// MISC //

// Test code to view HTML
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

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

const urlsForUser = (urlDatabase, userID) => {
  let urls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
};
