'use strict';

const { Client } = require('@notionhq/client');
const { BAD_REQUEST } = require('../core/responseHandler');

class NotionService {
    constructor() {
        this.notion = new Client({ auth: process.env.NOTION_TOKEN });
        this.upcommingPlansId = '18b8dbf4be7280b1ac32dfefbc5bb180';
        this.dailyLogId = '18b8dbf4be72801dbcc7c3c83131eabf';
        this.dailyScheduleId = '18b8dbf4be7280c3a502c5846890ca04';
    }

    async getData(databaseId, filter = {}, sorts = []) {
        if (!databaseId) throw new BAD_REQUEST('Database ID is required');

        return await this.notion.databases.query({
            database_id: databaseId,
            filter,
            sorts,
        });
    }

    static formatUTCTime(utcTime) {
        if (!utcTime.includes('T')) return null;

        const date = new Date(utcTime);
        return {
            hours: String(date.getUTCHours()).padStart(2, '0'),
            minutes: String(date.getUTCMinutes()).padStart(2, '0'),
        };
    }

    static formatUTCDate(utcDate) {
        utcDate = new Date(utcDate);
        return `${String(utcDate.getDate()).padStart(2, '0')}/${String(utcDate.getMonth() + 1).padStart(2, '0')}/${utcDate.getFullYear()}`;
    }

    static generateTodoMessage(jsonData) {
        // Lấy ngày từ task đầu tiên
        const firstTaskDate = new Date();
        const formattedDate = `${String(firstTaskDate.getDate()).padStart(2, '0')}/${String(firstTaskDate.getMonth() + 1).padStart(2, '0')}/${firstTaskDate.getFullYear()}`;

        let message = `📌 TO-DO: ${formattedDate}\n\n`;

        jsonData.forEach((task, index) => {
            // Lấy thông tin task
            const taskName = task.properties.Name.title[0].plain_text || 'None';
            const priority =
                task.properties['Priority Level']?.select.name || 'None';
            const timeInfo = task.properties.Time.date;

            // Xử lý thời gian
            let timeString = '';
            const startTime = NotionService.formatUTCTime(timeInfo.start);

            if (startTime) {
                timeString = `${startTime.hours}:${startTime.minutes}`;
                if (
                    new Date().toDateString() !==
                    new Date(timeInfo.start).toDateString()
                ) {
                    timeString += ` ${NotionService.formatUTCDate(timeInfo.start)}`;
                }

                if (timeInfo.end) {
                    const endTime = NotionService.formatUTCTime(timeInfo.end);
                    if (endTime) {
                        timeString += ` - ${endTime.hours}:${endTime.minutes}`;
                    }
                    if (
                        new Date().toDateString() !==
                        new Date(timeInfo.end).toDateString()
                    ) {
                        timeString += ` ${NotionService.formatUTCDate(timeInfo.end)}`;
                    }
                }
            }

            // Thêm vào message
            message += `✧ ${taskName}\n`;
            if (timeString) message += `   ➥ Time: ${timeString}\n`;
            if (priority !== 'None') {
                message += `   ➥ Priority:  ${priority}\n`;
            }

            // Thêm khoảng cách giữa các task
            if (index < jsonData.length - 1) {
                message += '\n';
            }
        });

        return message;
    }

    static isTodayInRange(start, end) {
        const startDay = new Date(start).setHours(0, 0, 0, 0);
        const endDay = end ? new Date(end).setHours(0, 0, 0, 0) : startDay;
        const today = new Date().setHours(0, 0, 0, 0);

        return today >= startDay && today <= endDay;
    }

    static isTomorrowInRange(start, end) {
        const startDay = new Date(start).setHours(0, 0, 0, 0);
        const endDay = end ? new Date(end).setHours(0, 0, 0, 0) : startDay;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        return tomorrow >= startDay && tomorrow <= endDay;
    }

    async getTasks(time, databaseArray = []) {
        /*
            "0000": Daily Schedule
            "0001": Daily Log
            "0002": Upcoming Plans
         */

        const databaseIds = databaseArray.map((item) => {
            if (item === '0000') {
                return this.dailyScheduleId;
            } else if (item === '0001') {
                return this.dailyLogId;
            } else if (item === '0002') {
                return this.upcommingPlansId;
            }
        });

        const filter = {
            property: 'State',
            status: {
                equals: 'In progress',
            },
        };

        const tasks = [];

        for (const databaseId of databaseIds) {
            const sorts =
                this.dailyScheduleId === databaseId
                    ? [
                          {
                              property: 'Priority Level',
                              direction: 'ascending',
                          },
                      ]
                    : [];

            const getData = await this.getData(databaseId, filter, sorts);

            const tasksSelect = getData.results.filter((task) => {
                const timeInfo = task.properties.Time?.date;
                if (!timeInfo) return true;

                if (time === 'today') {
                    return NotionService.isTodayInRange(
                        timeInfo.start,
                        timeInfo.end,
                    );
                } else if (time === 'tomorrow') {
                    return NotionService.isTomorrowInRange(
                        timeInfo.start,
                        timeInfo.end,
                    );
                }
            });

            tasks.push(...tasksSelect);
        }

        console.log('Tasks::', tasks);
        console.log(tasks.length);

        return tasks;
    }
}

module.exports = new NotionService();
