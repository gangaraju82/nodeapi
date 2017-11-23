// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var morgan = require('morgan');

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8000; // set our port

// DATABASE SETUP
MongoClient = require('mongodb').MongoClient;
//mongoose.connect('mongodb://localhost:27017/nodeapi'); // connect to our database


// Handle the connection event
// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));

// db.once('open', function() {
//     console.log("DB connection alive");
// });

// Bear models lives here
var Bear = require('./app/models/bear');

// ROUTES FOR OUR API
// =============================================================================
var url = 'mongodb://localhost:27017/nodeapi';
// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

// on routes that end in /bears
// ----------------------------------------------------
router.route('/bears')

// create a bear (accessed at POST http://localhost:8080/bears)
.post(function(req, res) {

    var bear = new Bear(); // create a new instance of the Bear model
    bear.name = req.body.name; // set the bears name (comes from the request)
    MongoClient.connect(url, function(err, db) {
        db.collection('bears').insert({ "name": bear.name }, function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Bear created!' });
        });
    });


})

// get all the bears (accessed at GET http://localhost:8080/api/bears)
.get(function(req, res) {
    MongoClient.connect(url, function(err, db) {
        db.collection('bears').find({}).toArray(function(err, bears) {
            if (err)
                res.send(err);

            res.json(bears);
        });
    });
});
// on routes that end in /bears/:bear_id
// ----------------------------------------------------
router.route('/bears/:bear_id')

// get the bear with that id
.get(function(req, res) {
    MongoClient.connect(url, function(err, db) {
        console.log(req.params.bear_id)
        var ObjectId = require('mongoose').Types.ObjectId;
        db.collection('bears').find({ _id: new ObjectId(req.params.bear_id) }).toArray(function(err, bear) {
            if (err)
                res.send(err);
            res.json(bear);
        });
    })
})

// update the bear with this id
.put(function(req, res) {
    var ObjectId = require('mongoose').Types.ObjectId;
    MongoClient.connect(url, function(err, db) {
        db.collection('bears').updateOne({ _id: new ObjectId(req.params.bear_id) }, { "name": req.body.name }, function(err, bear) {
            if (err)
                res.send(err);
            res.json({ message: 'Bear updated!' });

        })
    });
})

// delete the bear with this id
.delete(function(req, res) {
    var ObjectId = require('mongoose').Types.ObjectId;
    MongoClient.connect(url, function(err, db) {
        db.collection('bears').deleteOne({
            _id: new Object(req.params.bear_id)
        }, function(err, bear) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    })
});


// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);