"use strict"

const moment = require("moment");
const {curl} = require('urllib');

const ignoreError = {
    'AssertionError': 1,
    'InternalServerError': 1,
    'HttpError': 1,
    'AssertionError [ERR_ASSERTION]': 1
};

/**
 * 机器人报告消息
 * @param title {string}
 * @param content {string}
 */
async function send(title, content = "") {
    if (!global.config.ROBOT) {
        return;
    }

    const data = {
        msgtype: "markdown",
        markdown: {
            content: `
## ${title}
\`\`\`
    ${content}
\`\`\`
            `
        }
    }
    const opts = {
        method: 'POST',
        dataType: 'json',
        contentType: 'json',
        timeout: 5000,
        headers: {},
        data: data,
    }

    return curl(global.config.ROBOT, opts);
}

module.exports = {
    /**
     * 机器人报告错误消息
     * @param info {string} 辅助定位信息
     * @param err {Error}
     */
    sendError: function (info,err) {
        if (!ignoreError[err.name]) {
            send(`SERVER[${global.PROCESS_KEY}] ${info}  ${err.message}`, err.stack).catch(_ => _)
        }
    },
    /**
     * 机器人报告消息
     * @param title {string}
     * @param content {string}
     */
    send: function (title, content) {
        send(title, content).catch(_ => _)
    }
}
