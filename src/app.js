const express = require('express');
const app = express();
require('dotenv').config();
const notionService = require('./services/notion.service');
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

// Init route
// app.get('/', async (req, res) => {
//     await sendWebhook(['0000', '0002'], 'morning');
//     res.send('Successfull send webhook');
// });

const checkPaymentConditions = (payment, conditions) => {
    const contentRegex = new RegExp(conditions.content_regex);
    const accountRegex = new RegExp(conditions.account_regex);

    return (
        contentRegex.test(payment.content) && accountRegex.test(payment.account)
    );
};

// Route xử lý webhook
app.post('/webhook', (req, res) => {
    const token = req.headers['x-webhook-token'];
    const expectedToken = '123456789:ABCDEF'; // Token từ cấu hình webhook

    if (token !== expectedToken) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    const payload = req.body;

    if (!payload || !payload.payment) {
        return res.status(400).json({ message: 'Invalid webhook payload' });
    }

    const payment = payload.payment;

    // Điều kiện từ webhook config
    const conditions = {
        content_regex: '.*?',
        account_regex: '^456$',
    };

    if (!checkPaymentConditions(payment, conditions)) {
        return res
            .status(400)
            .json({ message: 'Payment does not meet conditions' });
    }

    console.log('payment::', payment);
    res.status(200).json({ message: 'Webhook processed successfully' });
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

module.exports = app;
