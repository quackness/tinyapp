const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

// random string generator
function generateRandomString() {
  let result = '';
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 6;
  for (let i = 0; i < length; i++) {
    const randomNum = Math.floor(Math.random() * characters.length);
    result += characters[randomNum];
  }
  return result;
};
generateRandomString();


const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

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
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//keep this above /:id
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get('/urls/:shortURL/edit', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show', templateVars);
});


// post routes
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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
