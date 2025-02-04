const express = require('express');
const app = express();
require('dotenv').config();
const notionService = require('./services/notion.service');
const cron = require('node-cron');
const axios = require('axios');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sendWebhook = async (taskIds, timeOfDay) => {
    try {
        console.log('Đang gửi webhook đến bot...');
        const tasks = await notionService.getTasks('today', taskIds, timeOfDay);
        const data = {
            type: ['discord', 'telegram'],
            message: tasks,
        };

        return await axios.post('http://localhost:3500/webhook', data);
    } catch (error) {
        console.error('Lỗi khi gửi webhook:', error.message);
    }
};

// Init route
app.get('/', async (req, res) => {
    const data = await sendWebhook(['0000', '0001', '0002'], 'morning');
    res.send("Okay");
});

// Cron jobs
cron.schedule('0 6 * * *', () => sendWebhook(['0000', '0002'], 'morning'));
cron.schedule('30 18 * * *', () => sendWebhook(['0000', '0001'], 'afternoon'));
cron.schedule('0 21 * * *', () => sendWebhook(['0000', '0001'], 'evening'));

// Handling 404 Error
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

module.exports = app;
