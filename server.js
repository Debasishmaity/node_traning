// Define different modules
const express = require('express');
const app = express();
const pool = require('./dbConfig').pool
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const initializedPassport = require('./passportConfig');

// initialized passport 
initializedPassport(passport)

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}))
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());


// Adding different routes
app.get('/', (req, res) => {
  res.render('index');
})

app.get('/users/register', (req, res) => {
  res.render('register');
})

app.get('/users/sign_in', (req, res) => {
  res.render('sign_in');
})

app.post('/users/sign_in', passport.authenticate('local', {
  successRedirect: '/users/dashboard',
  failureRedirect: '/users/sign_in'
}))

app.get('/users/dashboard', (req, res) => {
  res.render('dashboard', { user: req.user.name });
})

app.post('/users/register', async(req, res) => {
  let { name, email, username, password } = req.body;
  let errors = [];
  let hashedPassword = await bcrypt.hash(password, 10)

  pool.query('SELECT * from users where email = $1', [email],
  (err, results) => {
    if(err){
      throw err;
    }
    console.log(results.rows);
    if (results.rows.length > 0){
      errors.push({message: 'User already Exist'});
      res.render('register', {errors});
    }
    else{
      pool.query('INSERT into users(name,username,email,password) VALUES($1, $2, $3, $4) RETURNING id, password',
       [name,username, email, hashedPassword], (err,results) => {
         if(err){
          throw err;
         }
         console.log(results.rows);
       })
    }
  });
  res.render('sign_in');
})

app.get('/users/logout', (req, res) => {
  req.session.destroy(function (err) {
    res.redirect('/users/sign_in'); //Inside a callback… bulletproof!
  });
});
 

app.listen(2000, () => {
  console.log('hi I am express js with users servicce');
})