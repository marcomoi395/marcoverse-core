const index = (databaseId, data) => {
    return {
        cover: null,
        icon: null,
        parent: {
            type: 'database_id',
            database_id: databaseId,
        },
        properties: {
            'Account Receiver': {
                id: '%3DVyE',
                type: 'rich_text',
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: data.account_receiver || '',
                            link: null,
                        },
                        annotations: {
                            bold: false,
                            italic: false,
                            strikethrough: false,
                            underline: false,
                            code: false,
                            color: 'default',
                        },
                        plain_text: data.account_receiver || '',
                        href: null,
                    },
                ],
            },
            'Name Sender': {
                id: 'L%3AYp',
                type: 'rich_text',
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: data.rame_sender || '',
                            link: null,
                        },
                        annotations: {
                            bold: false,
                            italic: false,
                            strikethrough: false,
                            underline: false,
                            code: false,
                            color: 'default',
                        },
                        plain_text: data.name_sender || '',
                        href: null,
                    },
                ],
            },
            Type: {
                id: 'ZBTi',
                type: 'select',
                select:
                    data.debit_amount !== 0
                        ? {
                              id: 'th^v',
                              name: 'Expense',
                              color: 'red',
                          }
                        : {
                              id: 'BhO{',
                              name: 'Income',
                              color: 'green',
                          },
            },
            'Account Sender': {
                id: '%5C%7CY%40',
                type: 'rich_text',
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: data.account_sender || '',
                            link: null,
                        },
                        annotations: {
                            bold: false,
                            italic: false,
                            strikethrough: false,
                            underline: false,
                            code: false,
                            color: 'default',
                        },
                        plain_text: data.account_sender || '',
                        href: null,
                    },
                ],
            },
            Date: {
                id: 'fk%7Bf',
                type: 'date',
                date: {
                    start: data.date,
                    end: null,
                    time_zone: null,
                },
            },
            'Transaction ID': {
                id: 'jjZV',
                type: 'rich_text',
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: data.transaction_id,
                            link: null,
                        },
                        annotations: {
                            bold: false,
                            italic: false,
                            strikethrough: false,
                            underline: false,
                            code: false,
                            color: 'default',
                        },
                        plain_text: data.transaction_id,
                        href: null,
                    },
                ],
            },
            Amount: {
                id: 'ugl%3C',
                type: 'number',
                number: data.debit_amount || data.credit_amount,
            },
            Content: {
                id: 'title',
                type: 'title',
                title: [
                    {
                        type: 'text',
                        text: {
                            content: data.content,
                            link: null,
                        },
                        annotations: {
                            bold: false,
                            italic: false,
                            strikethrough: false,
                            underline: false,
                            code: false,
                            color: 'default',
                        },
                        plain_text: data.content,
                        href: null,
                    },
                ],
            },
        },
    };
};

module.exports = index;
