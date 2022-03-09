const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();

const PORT = 8080;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// helper functions and objects
function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  for (let i = 0; i < length; i++) {
    const randomNum = Math.floor(Math.random() * characters.length);
    result += characters[randomNum];
  }
  return result;
}

const urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};


const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  },
};

function findUserByEmail(email) {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
}

// get routes

app.get('/', (req, res) => {
  res.send('Hello');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', (req, res) => {
  const userID = req.cookies.user_id;
  const templateVars = {
    urls: urlDatabase,
    user: userID ? users[userID] : null,
  };
  res.render('urls_index', templateVars);
});

// keep this above /:id
app.get('/urls/new', (req, res) => {
  const userID = req.cookies.user_id;
    if (!userID) {
      res.redirect('/login');
    } else {
  const templateVars = {
    user: userID ? users[userID] : null}
  res.render('urls_new', templateVars);
  };
});


app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies.user_id;
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: userID ? users[userID] : null,
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL
  if (!urlDatabase[shortURL]) {
    return res.render('error', {errorMessage: 'Short URL does not exist, it has been changed. Use updated version of short URL.'})
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get('/urls/:shortURL/edit', (req, res) => {
  const userID = req.cookies.user_id;
  const shortURL = req.params.shortURL
  if (!urlDatabase[shortURL]) {
    return res.status(404).send('Short URL does not exist, it has been changed. Use updated version of short URL.');
  }
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: userID ? users[userID] : null,
  };
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  const userID = req.cookies.user_id;
  if (userID) {
    res.redirect('/urls');
  }
  res.render('login');
});

// post routes

app.post('/login', (req, res) => {
  const { email } = req.body;
  const { password } = req.body;
  const foundUser = findUserByEmail(email);
  if (foundUser === null || password !== foundUser.password) {
    return res.status(403).send('Invalid login credentials');
  }
  res.cookie('user_id', foundUser.id);
  return res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const userID = req.cookies.user_id;
  if (!userID) {
    return res.status(403).send('Please login to shorten the link');
  };
  const { longURL } = req.body;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL,
    userID
  } 
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL', (req, res) => {
  const { longURL } = req.body;
  const { shortURL } = req.params;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send('Short URL does not exist');
  }
  urlDatabase[shortURL]['longURL'] = longURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL
  if (!urlDatabase[shortURL]) {
    return res.status(404).send('Short URL does not exist, it has been changed. Use updated version of short URL.');
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const { email } = req.body;
  const { password } = req.body;
  if (email === '' || password === '') {
    return res.status(400).send('Email or password cannot be empty');
  }
  if (findUserByEmail(email)) {
    return res.status(400).send('Email already exists in the database');
  }
  const userID = generateRandomString();
  const user = {
    id: userID,
    email,
    password
  };
  users[userID] = user;
  console.log(users[userID]);
  res.cookie('user_id', userID);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
