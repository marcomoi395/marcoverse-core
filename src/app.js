const express = require('express');
const app = express();
require('dotenv').config();
const notionService = require('./services/notion.service');
const { BAD_REQUEST } = require('./core/responseHandler.js');
const cron = require('node-cron');
const axios = require('axios');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sendWebhook = async (taskIds, timeOfDay) => {
    console.log(
        'sending webhook::',
        new Date().toLocaleString('vi-VN', {
            timezone: 'Asia/Ho_Chi_Minh',
        }),
    );

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

const requestWebhook = async () => {
    try {
        const response = await fetch(process.env.REQUEST_URL, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        console.log('Request successful:', await response.text());
        return true;
    } catch (error) {
        console.error('Error accessing gateway:', error);
    }
};

// Init route
// app.get('/', async (req, res) => {
//     await requestWebhook();
//
//     return {
//         code: 200,
//         message: 'ok',
//     };
// });

const verifyToken = (req, res, next) => {
    const { token } = req.body;

    if (!token) {
        return res
            .status(401)
            .json({ message: 'Unauthorized: Token is missing' });
    }

    if (token !== process.env.WEBHOOK_TOKEN) {
        // Thay bằng token thực tế của bạn
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
    next();
};

// Route xử lý webhook
app.post('/webhook', verifyToken, async (req, res) => {
    try {
        const { payment } = req.body;
        // Save data to notion
        await notionService.setDataForBudgetTracker(payment);

        res.status(200).send('Data received');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Cron jobs
cron.schedule(
    '0 6 * * *',
    () => {
        console.log(
            "It's 6:00 AM, sending morning webhook...",
            new Date().toLocaleString('vi-VN', {
                timezone: 'Asia/Ho_Chi_Minh',
            }),
        );
        sendWebhook(['0000', '0002'], 'morning');
    },
    {
        timezone: 'Asia/Ho_Chi_Minh',
    },
);

cron.schedule(
    '0 20 * * *',
    async () => {
        console.log(
            "It's 8:00 PM, accessing http://app/gateways/start-gate...",
            new Date().toLocaleString('vi-VN', {
                timezone: 'Asia/Ho_Chi_Minh',
            }),
        );
        requestWebhook();
    },
    {
        timezone: 'Asia/Ho_Chi_Minh',
    },
);

module.exports = app;
