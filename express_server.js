const express = require('express');
const bodyParser = require('body-parser');
const { generateRandomString } = require('./helpers');
const { urlsForUser } = require('./helpers');
const { urlDatabase } = require('./helpers');
const { findUserByEmail } = require('./helpers');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

const app = express();

const PORT = 8080;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));


app.use(
  cookieSession({
    name: 'session',
    keys: ['random keys pink', 'random keys blue']
  })
);



// helper functions and objects
// function generateRandomString() {
//   let result = '';
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   const length = 6;
//   for (let i = 0; i < length; i++) {
//     const randomNum = Math.floor(Math.random() * characters.length);
//     result += characters[randomNum];
//   }
//   return result;
// }

// const urlsForUser = (id) => {
//   let newObj = {};
//   for ( short in urlDatabase) {
//     const userID = urlDatabase[short].userID;
//     if (id === userID) {
//       newObj[short] = urlDatabase[short];    
//     } 
//   }
//   return newObj;
// };

// const urlDatabase = {
//   b6UTxQ: {
//         longURL: "https://www.tsn.ca",
//         userID: "aJ48lW"
//   },
//   i3BoGr: {
//       longURL: "https://www.google.ca",
//       userID: "aJ48lW"
//   }
// };

//edited object to store hashed passwords 
const users = {
  ivR5b2: {
    id: 'ivR5b2',
    email: 'dubajkaro@gmail.com',
    password: '$2a$10$475dKCDSjFtKRFbNwm9QWeOLoPpw0i9aGOSbZ3BiZKxA2Sn.qBiKu'
  },
  Qviy2H: {
    id: 'Qviy2H',
    email: 'dubajkaro+1@gmail.com',
    password: '$2a$10$JzHpgp2.3amJohtM9Fv8Ae4k9rwv74GYTxQFV9w2YGrAnabGl3gJS'
  },
};


// get routes

// app.get('/', (req, res) => {
//   res.send('Hello');
// });

// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.render('error', {errorMessage: 'Please login or register to see your own shortened URLs'})
  }
  const urls = urlsForUser(userID)
  console.log('urls:', urls);
    const templateVars = {
      urls,
      user: userID ? users[userID] : null,
    }
    res.render('urls_index', templateVars);
  });


// keep this above /:id
app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;
    if (!userID) {
      res.redirect('/login');
    } else {
  const templateVars = {
    user: userID ? users[userID] : null}
  res.render('urls_new', templateVars);
  };
});


app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (!req.session.user_id) {
    return res.render('error', {errorMessage: 'Please login or register to see your own shortened URLs'})
  };
  const userURLs = urlsForUser(userID);
  if (!Object.keys(userURLs).includes(shortURL)) { //shortURL is a dynamic var.
    return res.render('error', {errorMessage: 'This short URL does not belong to you'})
  };
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
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL
  if (!urlDatabase[shortURL]) {
    return res.status(404).send('Short URL does not exist, it has been changed. Use updated version of short URL.');
  }
  const userURLs = urlsForUser(userID);//we get all urls for that user
  if (!Object.keys(userURLs).includes(shortURL)) { //shortURL is a dynamic var./we are checking if the short url exists in db
    return res.render('error', {errorMessage: 'This short URL does not belong to you, you cannot edit it'})
  };
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
  const userID = req.session.user_id;
  if (userID) {
    res.redirect('/urls');
  }
  res.render('login');
});



// post routes

app.post('/login', (req, res) => {
  const { email } = req.body;
  const { password } = req.body;
  if (email === '' || password === '') {
    return res.send('<h3> Email and password fields cannot be empty </h3><p><a href="/login"> Back to login </a></p>')
  }
  const foundUser = findUserByEmail(email, users);
  if (foundUser === null) {
    return res.send('<h3> Invalid login credentials </h3><p><a href="/login"> Back to login </a></p>')
  }
  const isPasswordMatching = bcrypt.compareSync(password, foundUser.password);
  if (!isPasswordMatching) {
    return res.send('<h3> Invalid login credentials </h3><p><a href="/login"> Back to login </a></p>')
  }
  req.session.user_id = foundUser.id;
  return res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null,
  res.redirect('/urls');
});


app.post('/urls', (req, res) => {
  const userID = req.session.user_id;
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
  const userID = req.session.user_id;
  const userURLs = urlsForUser(userID);//we get all urls for that user
  if (!Object.keys(userURLs).includes(shortURL)) { //shortURL is a dynamic var./we are checking if the short url exists in db
    return res.render('error', {errorMessage: 'This short URL does not belong to you, you cannot edit it'})
  };
  urlDatabase[shortURL]['longURL'] = longURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send('Short URL does not exist, it has been changed. Use updated version of short URL.');
  }
  const userURLs = urlsForUser(userID);//with function we get all urls for that user
  if (!Object.keys(userURLs).includes(shortURL)) { //shortURL is a dynamic var./we are checking if the short url exists in db
    return res.render('error', {errorMessage: 'This short URL does not belong to you, you cannot delete it'})
  };
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const { email } = req.body;
  const { password } = req.body;
  if (email === '' || password === '') {
    return res.status(400).send('Email or password cannot be empty');
  }
  if (findUserByEmail(email, users)) {
    return res.status(400).send('Email already exists in the database');
  }
  const userID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);//function for hashing password
  const user = {
    id: userID,
    email,
    password: hashedPassword
  };
  users[userID] = user;
  console.log(users[userID]);
  res.cookie('user_id', userID);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
