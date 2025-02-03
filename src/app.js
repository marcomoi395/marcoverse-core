const express = require('express');
const app = express();
require('dotenv').config();
const notionService = require('./services/notion.service');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Init routes
app.get("", async (req, res) => {
    const getData = await notionService.getTasks('tomorrow', ['0000', '0001', '0002']);
    res.json(getData);
})

// Hanling Error
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});


module.exports = app;
