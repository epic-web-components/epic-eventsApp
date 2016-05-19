/*global require */
/*jslint node: true nomen: true es5: true */

'use strict';

var express = require('express'),
    app = express(),
    GCLOUD_PROJECT = 'mauijim-1289',
    gcloud = require('gcloud')({
        projectId: GCLOUD_PROJECT,
        keyFilename: 'google_keyfile.json'
    }),
    exphbs = require('express-handlebars'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, __dirname + '/uploads');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname);
        }
    }),
    upload = multer({
        dest: 'uploads/',
        storage: storage
    }),
    /* Gooogle Cloud Config */
    datastore = gcloud.datastore({}),
    kind = 'Event',
    gcs = gcloud.storage(),
    bucket = gcs.bucket('mauijim-1289.appspot.com'),
    port = 3000;

/* Handlebars view engine */
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

/* Post body support */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/* Static Routes */
app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static(__dirname + '/uploads'));

/* Functionality */
app.use('/new', function (req, res, next) {
    res.render('newEvent', {});
});

app.use('/events', function (req, res, next) {
    res.render('events', {});
});

app.get('/', function (req, res, next) {
    res.redirect('/events');
});

app.post('/', upload.single('photo'), function (req, res) {
    //    console.log(req.file);
    //    console.log(req.body);

    var eventData = {
            name: req.body.eventName,
            summary: req.body.summary,
            location: req.body.eventLocation,
            description: req.body.description,
            dateStart: req.body.dateStart,
            dateEnd: req.body.dateEnd,
            timeStart: req.body.timeStart,
            timeEnd: req.body.timeEnd,
            blogPostUrl: req.body.blogPostUrl,
            eventType: '',
            externalUrl: req.body.externalUrl,
            image: 'uploads/' + req.file.filename
        },
        eventKey = datastore.key(kind);

    // save to google datastore
    datastore.save({
        key: eventKey,
        data: eventData
    }, function (err, apiResponse) {
        if (err) {
            console.log(err);
        }
        console.log(apiResponse);
    });

    res.render('events', {
        newEventTitle: req.body.eventName,
        newEventLocation: req.body.eventLocation,
        newEventDateStart: req.body.dateStart,
        newEventDateEnd: req.body.dateEnd,
        newEventTimeStart: req.body.timeStart,
        newEventTimeEnd: req.body.timeEnd,
        newEventSummary: req.body.summary,
        newEventDescription: req.body.description,
        newEventBlogPostUrl: req.body.blogPostUrl,
        newEventExternalUrl: req.body.externalUrl,
        newEventImgUrl: 'uploads/' + req.file.filename
    });
});

// Basic 404 handler
app.use(function (req, res) {
    res.status(404).send('Not Found');
});

// Basic error handler
app.use(function (err, req, res, next) {
    /* jshint unused:false */
    console.error(err);
    // If our routes specified a specific response, then send that. Otherwise,
    // send a generic message so as not to leak anything.
    res.status(500).send(err.response || 'Something broke!');
});

app.listen(process.env.PORT || port, function () {
    console.log('Server listening on port 3000 \nhttp://localhost:3000');
});
