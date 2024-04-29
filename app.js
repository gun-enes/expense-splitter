require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo');
const connectDB = require('./server/config/db.js');

const app = express();
const PORT = 5000 || process.env.PORT;
 
connectDB();

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: 'auto' },
	store: MongoStore.create({
	  mongoUrl: process.env.MONGODB_URI
	}),
  }));

app.use(express.static('public'));

app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.use('/', require('./server/routes/main.js'));
app.use('/', require('./server/routes/admin'));
 
app.listen(PORT , () => {
	console.log("App listening on port " + PORT);
});