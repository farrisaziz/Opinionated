var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var logger = require("morgan");

var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));

// Setup data parsing Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Use Static Public
app.use(express.static('app/public'));

// Setup Handlebars
app.set('views', './app/views');
app.engine("hbs", exphbs({
	layoutsDir: "./app/views/layouts",
	defaultLayout: "main",
	extname: '.hbs',
	helpers: {
	    section: function(name, options){
	        if(!this._sections) this._sections = {};
	        this._sections[name] = options.fn(this);
	        return null;
	    }
	}
}));
app.set("view engine", ".hbs");

// Routes
var routes = require('./app/routes/api_routes.js')(app);

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// // Connect to MongoDB & 
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
	console.log('Connection to database is active');
});

var PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
  console.log("App listening on port http://localhost:" + PORT);
});