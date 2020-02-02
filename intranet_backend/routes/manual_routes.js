const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Chapter = require("../models/models").Chapter;

//Connect to mongoDB
mongoose.connect('mongodb://localhost:27017/intranet');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));

router.get('/tableofcontents', (req, res, next) => {
    Chapter.find({}, (err, responseObject) => {
        if (err) {
            res.status(500);
            res.send(err);
        } else {
            res.status(200);
            res.send(responseObject);
        }
    })
})


module.exports = router;
