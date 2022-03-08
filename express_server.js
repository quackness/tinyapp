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
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com', 
    password: 'dishwasher-funk'
  }
}

function findUserByEmail(email) {
  for (let id in users) {
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
  const userID = req.cookies['user_id'];
  const templateVars = {
    urls: urlDatabase,
    user: userID ? users[userID] : null
  };
  res.render('urls_index', templateVars);
});

// keep this above /:id
app.get('/urls/new', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    user: userID ? users[userID] : null
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: userID ? users[userID] : null
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get('/urls/:shortURL/edit', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: userID ? users[userID] : null
  };
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login')
});


// post routes

app.post('/login', (req, res) => {
  const email = req.body.email;//req. hey server do this or give me this; res is answer from the server
  const password = req.body.password;
  const foundUser = findUserByEmail(email);//object
  if (foundUser === null || password !== foundUser.password) {
    return res.status(403).send('Invalid credentials');
    
  } else {
    res.cookie('user_id', foundUser.id);
    return res.redirect('/urls');
  };
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const { longURL } = req.body;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL', (req, res) => {
  const { longURL } = req.body;
  const { shortURL } = req.params;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
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
  }
  users[userID] = user;
  console.log(users[userID]);
  res.cookie('user_id', userID);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
