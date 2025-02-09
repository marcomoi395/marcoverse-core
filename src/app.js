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
        const tasks = await notionService.getTasks('today', taskIds, timeOfDay);
        const data = {
            type: ['discord', 'telegram'],
            message: tasks,
        };

        return await axios.post(process.env.WEBHOOK_URL, data);
    } catch (error) {
        console.error('Lỗi khi gửi webhook:', error.message);
    }
};

// Init route
app.get('/', async (req, res) => {
    await sendWebhook(['0000', '0001'], 'morning');
    res.send('Successfull send webhook');
});

// Cron jobs
cron.schedule(
    '0 6 * * *',
    () => {
        console.log(
            "It's 6:00 AM, sending morning webhook...",
            new Date().toLocaleString(),
        );
        sendWebhook(['0000', '0002'], 'morning');
    },
    {
        timezone: 'Asia/Ho_Chi_Minh',
    },
);

cron.schedule(
    '30 18 * * *',
    () => {
        console.log(
            "It's 6:30 PM, sending evening webhook...",
            new Date().toLocaleString(),
        );
        sendWebhook(['0000', '0001'], 'afternoon');
    },
    {
        timezone: 'Asia/Ho_Chi_Minh',
    },
);
cron.schedule(
    '0 21 * * *',
    () => {
        console.log(
            "It's 9:00 PM, sending evening webhook...",
            new Date().toLocaleString(),
        );
        sendWebhook(['0000', '0001'], 'evening');
    },
    {
        timezone: 'Asia/Ho_Chi_Minh',
    },
);

// Handling 404 Error
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

module.exports = app;
