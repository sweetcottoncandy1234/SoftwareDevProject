// Load the modules
var express = require('express'); 
var app = express();
var bodyParser = require('body-parser'); 
app.use(bodyParser.json());              
app.use(bodyParser.urlencoded({ extended: true })); 
const axios = require('axios');
const qs = require('query-string');
const API = 'https://www.themealdb.com/api/json/v1/1/search.php';

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));

var pgp = require('pg-promise')();
const dev_dbConfig = {
  host: 'db',
  port: 5432,
  database: process.env.DB_SCHEMA,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
};

const isProduction = process.env.NODE_ENV === 'production';
const dbConfig = isProduction ? process.env.DATABASE_URL : dev_dbConfig;
if (isProduction) {
    pgp.pg.defaults.ssl = {rejectUnauthorized: false};
}

var db = pgp(dbConfig);

app.get('/', function(req, res) {
  res.render('pages/main', {
    my_title: "Main Page",
    items: '',
    movie: false,
    error: false,
    message: ''
  });
});

app.get('/review', function(req, res) {
  // var data = [
  //   {'key': 'value', 'name': 'pasta', 'review': 'I like pasta', 'review_date': '2017-03-31 9:30:20'},
  //   {'key': 'value2', 'name': 'chicken', 'review': 'I like chicken less than pasta', 'review_date': '2017-03-31 9:30:21'}
  // ];
  var query = "SELECT * FROM review"
  db.any(query).then(data =>{
  res.render('pages/review',{
    my_title: 'pageTitle',
      reviews: data,
      error: false
  })
})
.catch(err =>{
  console.log('Uh Oh I made an oopsie');
  console.log(err);
  res.render('pages/review',{
    my_title: 'pageTitle',
    reviews: false,
    error: err,
    message: ''
  })
});
});
  // res.render('pages/review', {
  //   my_title: "Review",
  //   items: '',
  //   reviews: data,
  //   url: API,
  //   error: false,
  //   message: ''
  // });
// yy
// app.post('/get_feed', function(req, res) {
//   var title = req.body.title; 
//   //var api_key = 'JMQFiqEimCkZ8EFmmIXq9GnDjCaA50We'; 

//   if(title) {
//     axios({
//       url: `www.themealdb.com/api/json/v1/1/search`,
//         method: 'GET',
//         dataType:'json',
//       })
//       .then(items => {
//         res.render('pages/main', {
//           my_title: "Food",
//           items: items.data.results,
//           error: false,
//           message: ''
//         })
//       })
//       .catch(error => {
//         console.log(error);
//         res.render('pages/main',{
//           my_title: "Food",
//           items: '',
//           error: true,
//           message: ''
//         })
//       });
//   }
//   else {
//     // TODO: Render the home page and include an error message (e.g., res.render(...);); Why was there an error? When does this code get executed? Look at the if statement above
//     // Stuck? On the web page, try submitting a search query without a search term
//   }
// });

app.post('/addReview', function(req, res) {
  db.none("INSERT INTO review(meal_name, review, review_date) VALUES (${title}, ${rev}, ${date});", {
      title: req.body.rname,
      rev: req.body.review,
      date: new Date()
    })
    .then( () => {
      res.redirect('/review');
    })
    .catch(error => {
      res.render('pages/main', {
        my_title: pageTitle,
        movie: '',
        error: error,
        message: ''
      });
    });
});

app.post('/get_feed', function(req, res) {
  var search = req.body.search;
  var url = `${API}?s=${search}`;
  if (search) {
    axios({
      url: url,
      method: 'GET',
      dataType: 'json'
    })
      .then(items => {
        res.render('pages/main', {
          my_title: 'pageTitle',
          movie: items.data,
          url: url,
          error: false,
          message: ''
        })
      })
      .catch(error => {
        res.render('pages/main', {
          my_title: 'pageTitle',
          movie: false,
          url: url,
          error: error,
          message: ''
        })
      });
  } else {
    res.render('pages/main', {
      my_title: 'pageTitle',
      movie: false,
      url: url,
      error: false,
      message: ''
    });
  }
});


app.post('/review', function(req, res) {
  var search = req.body.search;
  var query;
  if(search)
  {
    query = `SELECT * FROM review where meal_name LIKE '%${search}%';`;
  }
  else{
    query = 'SELECT * FROM review';
  }
  console.log(query);
  db.any(query)
    .then(rows => {
      res.render('pages/review',{
        my_title: 'pageTitle',
        reviews: rows,
        error: '',
        message: ''

      });
    })
    .catch(error => {
      res.render('pages/review',{
        my_title: 'pageTitle',
        reviews: '',
        error: error,
        message: ''
      })
    })
});


app.post('/get_feed', function(req, res) {
  var search = req.body.search;
  var url = `${API}?s=${search}`;
  if (search) {
    axios({
      url: url,
      method: 'GET',
      dataType: 'json'
    })
      .then(items => {
        res.render('pages/main', {
          my_title: 'pageTitle',
          movie: items.data,
          url: url,
          error: false,
          message: ''
        })
      })
      .catch(error => {
        res.render('pages/main', {
          my_title: 'pageTitle',
          movie: false,
          url: url,
          error: error,
          message: ''
        })
      });
  } else {
    res.render('pages/main', {
      my_title: 'pageTitle',
      movie: false,
      url: url,
      error: false,
      message: ''
    });
  }
});


// app.listen(3000);
// console.log('3000 is the magic port');
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on ${server.address().port}`);
});

module.exports = server;